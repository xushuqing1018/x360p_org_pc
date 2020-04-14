<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="800" :mask-closable="false">
		<div style="min-height: 400px;overflow: auto">
			<table class="modal-table">
	            <thead>
	                <tr>
	                	<th><div class="ivu-table-cell">服务对象</div></th>
	                    <th><div class="ivu-table-cell">服务类型</div></th>
	                    <th><div class="ivu-table-cell">截止时间</div></th>
	                    <th><div class="ivu-table-cell">回访来源</div></th>
	                    <th width="150px"><div class="ivu-table-cell">备注</div></th>
	                    <th><div class="ivu-table-cell">责任人</div></th>
	                    <th><div class="ivu-table-cell">状态</div></th>
	                    <th v-if="mode=='add'"><div class="ivu-table-cell">操作</div></th>
	                </tr>
	            </thead>
	            <tbody>
	                <tr v-for="item in data">
	                	<td><div class="ivu-table-cell">{{getServiceObj(item)}}</div></td>
	                    <td>
	                    	<div class="ivu-table-cell">
	                    		<span v-if="item.cid > 0">{{item.st_did|dict_title('class_service_type')}}</span>
	                    		<span v-else>{{item.st_did|dict_title('student_service_type')}}</span>
	                    	</div>
	                	</td>
	                    <td><div class="ivu-table-cell">{{item.int_day|int_date}}</div></td>
	                    <td><div class="ivu-table-cell">
	                    	<Tooltip v-if="item.student_return_visit">
	                    		<span class="text-info cursor">{{item.student_return_visit.eid|ename}}</span>
	                    		<div slot="content">
	                    			<p>回访内容：{{item.student_return_visit.content}}</p>
	                    			<p>回访时间：{{item.student_return_visit.create_time}}</p>
	                    		</div>
	                    	</Tooltip>
	                    	<span v-else>无</span>
	                    </div></td>
	                    <td><div class="ivu-table-cell">{{item.remark}}</div></td>
	                    <td><div class="ivu-table-cell">{{item.own_eid|ename}}</div></td>
	                    <td><div class="ivu-table-cell" :class="item.status == 1?'text-success':'text-danger'">
	                    	{{item.status == 1?'已完成':'未完成'}}
	                    </div></td>
	                    <td v-if="mode=='add'">
	                    	<div class="ivu-table-cell">
	                    		<Button v-if="item.status == 0" type="text" size="small" icon="edit" @click="editInfo(item)"></Button>
	                    		<Button type="text" size="small" icon="ios-trash" @click="delInfo(item)"></Button>
	                    	</div>
	                    </td>
	                </tr>
	                <tr v-if="data.length==0"><td colspan="6"><div class="ivu-table-cell text-center">没有数据</div></td></tr>
	            </tbody>
	        </table>
	        <div class="list-page clearfix mt-3">
	            <Page 
	            	class="pull-right" 
	            	size="small" 
	            	:total="total" 
	            	:show-total="true" 
	            	:current="pageIndex" 
	            	:show-sizer="true" 
	            	:page-size="pageSize" 
	            	@on-change="pagenation" 
	            	@on-page-size-change="pagesize">
	            </Page>
	       </div>
        </div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	export default{
		mixins: [ grid,common,globals,modal],
		props: {
			intDay: {
				type: String,
				default: ''
			},
			mode: {
				type: String,
				default: ''
			}
		},
		data () {
			return {
				pk: 'st_id',
				rest_api: 'service_tasks'
			}
		},
		mounted(){
			this.init_data()
		},
		methods: {
			getServiceObj (item) {
				let result = ''
				if(item.cid > 0){
					result = item.one_class?item.one_class.class_name:''
				}else if(item.sid > 0){
					result = item.student?item.student.student_name:''
				}else if(item.cu_id > 0){
					result = item.customer?item.customer.name:''
				}else {
					result = this.$filter('branch_name')(item.bid)
				}
				
				return result
			},
			hook_get_param (params) {
				let t = moment().format('YYYYMMDD')
				params.with = 'student,one_class,customer,student_return_visit'
				params.int_day = this.$filter('format_int_day')(this.intDay)
			},
			delInfo(item) {
				this.confirm('确定删除这条服务安排吗？')
				.then(_=>{
					this.delete(item)
				})
			},
			editInfo (item) {
				let title = util.sprintf('更新服务安排【%s】',this.getServiceObj(item))
				
				this.$Modal.open('service/service/task-modal.vue',{
					on:{
						'on-success':()=>{
							this.$emit('on-success')
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.set('info',item)
					.show(title,'edit')
				})
			}
		}
	}
</script>

<style>
</style>