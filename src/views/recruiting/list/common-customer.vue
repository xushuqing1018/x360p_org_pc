<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :mask-closable="false" :width="900">
		<div class="mb-3">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item class="col-md-3 mb-1" label="客户名称" prop="name">
					<Input v-model="search_field.name" placeholder="请输入客户名称"></Input>
				</Form-item>
				<Form-item class="col-md-3 mb-1" label="手机号" prop="first_tel">
					<Input v-model="search_field.first_tel" placeholder="请输入手机号"></Input>
				</Form-item>
				<Form-item label="市场渠道" prop="school_id" class="col-md-3 mb-1">
					<select-channel v-model="search_field.mc_id" :show-add="false" clearable></select-channel>
				</Form-item>
				<Form-item class="col-md-3 mb-1" label="前责任人" prop="follow_eid">
					<select-employee v-model="search_field.follow_eid"></select-employee>
				</Form-item>
			</Form>
			<Button size="small" type="primary" icon="ios-search" @click="search">搜索</Button>
			<Button size="small" type="primary" icon="refresh" @click="resetSearch">重置</Button>
			<export-button 
				res="customers" 
				:params="params" 
				size="small" 
				v-per="'customer.export'" 
				:total="total" 
				form-name="common_customer_export_form"
				:max-sync-nums="1000"
				>
			</export-button>
		</div>
		
		<div class="content">
			<div class="toolbar mb-3">
				<Button 
					size="small" 
					:disabled="select_cu_ids.length==0" 
					type="primary" 
					icon="person" 
					title="批量获取客户" 
					@click="getCommonCustomer('multi')">
					抢
				</Button>
				<Button 
					v-per="'customer.all'"
					class="ml-2" 
					size="small" 
					type="primary" 
					icon="log-out" 
					:disabled="select_cu_ids.length==0"
					@click="outCommonCustomer" 
					title="批量转出客户">
					转出到客户
				</Button>
			</div>
			
			<div class="content-body">
	            <Table 
	            	v-loading="'customers'"
	            	class="customer-list" 
	            	ref="tableExcel"
	            	:page="pageIndex" 
	            	:page-size="pageSize" 
	            	:stripe="true" 
	            	:show-header="true" 
	            	:data="data" 
	            	:columns="columns" 
	            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
	            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT"
	            	@on-selection-change="selectChange"
	            	@on-sort-change="sortChange"> 
	            </Table>
	        </div>
	        <div class="content-footer">	        	
	            <div class="pagenation text-right">
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
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectChannel from 'c%/SelectChannel.vue'
	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [ grid, modal, globals, common ],
		props: {
			parent$:{
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		components: {
			SelectEmployee,
			SelectChannel,
			ExportButton
		},
		data () {
			return {
				rest_api: 'customers',
				pk: 'cu_id',
				showCheckbox: true,
				select_cu_ids: [],
				search_field: {
					name: '',
					follow_eid: 0,
					first_tel: '',
					mc_id: 0					
				},
				column_keys: {
					name: {
						title: '客户名称',
						show: true,
						width: 100
					},
					contact: {
						title: '联系人',
						show: true,
						width: 80
					},
					first_tel: {
						title: '手机号',
						show: true,
						width: 120
					},
					last_follow_up: {
						title: '最后跟进记录',
						show: true,
						width: 200
					},
					channel_name:{
						title:'市场渠道',
						show:true
					},
					follow_eid: {
						title: '前负责人',
						show: true,
						width: 100
					},
					operation: {
						title: '操作',
						show: true
					}
				},
				column_render: {
					contact (h,params) {
						let name = params.row.first_family_name||''	
						return  h('span',this.$filter('family_rel')(params.row.first_family_rel)+name)
					},
					channel_name (h,params) {
						return h('span',params.row.channel_name||'-')
					},
					last_follow_up (h,params){
						let obj = params.row.last_customer_follow_up,
							result = '-',
							tool_tip = null,
							view_btn = null
						if(obj){
							result = obj.content
						}
						
						view_btn = h('Button',{
							'class': {
								'pull-right': true
							},
							attrs: {
								'title': '查看全部'								
							},
							props: {
								type: 'primary',
								size: 'small'
							},
							on: {
								'click': () => {
									this.followRecord(params.row)
								}
							}
						},'查看全部')
						
						tool_tip = h('Tooltip',{
							'class':'x-tooltip',
							props: {
								content: result								
							}
						},[
							h('p',{
								'class': 'text-over-elips',
								style: {
									width: '100px'
								},
							},result)
						])
						
						if(params.row.follow_times == 0){
							view_btn = ''
						}
						
						return h('div',[tool_tip,view_btn])
					},
					follow_eid (h, params) {
						return h('span',this.$filter('ename')(params.row.follow_eid,'-'))
					},
					operation (h,params) {
						return h('Button',{
							props: {
								size: 'small',
								type: 'primary'
							},
							on: {
								click: ()=>{
									this.getCommonCustomer('single',params.row)
								}
							}
						},'抢')
					}
				}
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val){
					this.init_data()					
				}
			}
		},
		methods: {
			resetSearch () {
				this.$refs['ref_search'].resetFields()
				this.search()
			},
			outCommonCustomer () {				
				this.$Modal.open('recruiting/list/choose-follower-modal.vue',{					
					on: {
						'on-success': ()=>{
							this.$emit('on-success')
							this.init_data()
						}
					}
				}).then(modal=>{
					modal
					.set('cu_ids',this.select_cu_ids)
					.show('选择责任人')
				})
				
			},
			getCommonCustomer (type,row) {
				let params = {}
				
				if(type == 'multi'){
					params.cu_ids = this.select_cu_ids
				}else{
					params.cu_ids = [row.cu_id]
				}
				
				this.$rest('customers/robPublicSea')
				.post(params)
				.success(data=>{
					this.$Message.success('操作成功！')
					this.$emit('on-success')
					this.init_data()
				}).error(response=>{
					this.$Message.error(response.body.message||'获取失败~')
				})
				
				
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				
				params.is_public = 1
				
				for(let o in search_obj) {
					let property = search_obj[o]				
				
					if(property&&property!=-1){
						params[o] = property
					}				
				}
			},
			selectChange (selection) {
				this.select_cu_ids = []
				selection.forEach(item => {
					this.select_cu_ids.push(item.cu_id)
				})
			},
			followRecord (row) {
				if(row.follow_times == 0){
					return
				}
				
				this.$Modal.open('recruiting/following/follow-info-modal.vue')
				.then(modal=>{
					modal
					.set('cu_id',row.cu_id)
					.set('customerInfo',row)
					.set('currentIndex',row._index)
					.set('tabs','follow_record')
					.show(`沟通记录【${row.name}】`)
				})				
			}
		}
	}
</script>

<style>
</style>