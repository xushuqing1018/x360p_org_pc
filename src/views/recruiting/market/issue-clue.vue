<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :mask-closable="false" :width="900">
		<div class="mb-3">
			<Form ref="ref_search" :model="search_field" :label-width="80" class="filter-form row">
				<Form-item class="col-md-4 mb-1" label="客户名称" prop="name">
					<Input v-model="search_field.name" placeholder="请输入客户名称"></Input>
				</Form-item>
				<Form-item class="col-md-4 mb-1" label="手机号" prop="first_tel">
					<Input v-model="search_field.tel" placeholder="请输入手机号"></Input>
				</Form-item>
			</Form>
			<Button size="small" type="primary" icon="ios-search" @click="search">搜索</Button>
			<Button size="small" type="primary" icon="refresh" @click="resetSearch">重置</Button>
			<CheckboxGroup v-model="search_field.is_out" class="ml-2" style="display: inline;">
				<Checkbox :label="1">已取出</Checkbox>
				<Checkbox :label="0">未取出</Checkbox>
			</CheckboxGroup>
		</div>
		
		<div class="content">
			<div class="toolbar mb-2">
				<Button 
					v-per="'clue.checkout'"
					size="small" 
					type="primary" 
					icon="log-out" 
					:disabled="mcl_ids.length==0"
					@click="batchGetout(1)" 
					>
					批量取出
				</Button>
			</div>
			
			<div class="content-body">
	            <Table 
	            	v-loading.like="'market_clues'"
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
			SelectEmployee
		},
		data () {
			return {
				rest_api: 'market_clues/get_assign_market_clues',
				pk: 'mcl_id',
				showCheckbox: true,
				mcl_ids: [],
				search_field: {
					name: '',
					tel: '',
					is_out: [0,1]				
				},
				column_keys: {
					name: {
						title: '姓名'
					},
					tel: {
						title: '电话'
					},
					checkout_time: {
						title: '取出状态'
					},
					bid: {
						title: '取出到校区'
					},
					operation: {
						title: '操作',
						width: 80
					}
				},
				column_render: {
					bid (h,params) {
						return h('span',this.$filter('branch_name')(params.row.bid,'-'))
					},
					checkout_time (h,params) {
						if(params.row.checkout_eid) {
							return h('div',[
								h('p',this.$filter('ename')(params.row.checkout_eid)),
								h('p',{class:'text-success'},'于'+params.row.checkout_time+'取出')
								])
						}
						else {
							return h('span',{
								class:'text-danger'
							},'未取出')
						}
					},
					operation (h,params) {
						return h('Button',{
							props: {
								size: 'small',
								type: 'primary'
							},
							style: {
								display:params.row.checkout_eid?'none':'inline-block'
							},
							directives: [{
								name: 'per',
								value: 'clue.checkout'
							}],
							on: {
								click: ()=>{
									this.batchGetout(0,params.row)
								}
							}
						},'取出')
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
			batchGetout (type,row) {
				let mcl_ids = []
				if(type) {
					mcl_ids = this.mcl_ids
				}else{
					mcl_ids.push(row.mcl_id)
				}	
				this.confirm('确定取出到当前校区吗？')
				.then(() => {
					this.$rest('market_clues').add_url_param('checkout')
					.post({
						mcl_ids: mcl_ids,
						checkout_eid: this.eid$
					})
					.success(res => {
						this.$Message.success('取出成功')
						this.$emit('on-success')
						this.init_data()
					})
					.error(res => {
						this.$Message.error(res.body.message)
					})
				})
			},
			deal_data(data) {
				data.list.forEach(l => {
					if(l.checkout_eid) {
						l._disabled = true
					}
				})
				return data.list
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				
				for(let o in search_obj) {
					let property = search_obj[o]				
					if(o=='is_out') {
						if(property.length==1) {
							if(property[0]==1) {
								params.checkout_eid = '[>,0]'
							}
							else{
								params.checkout_eid = 0
							}
						}
					}else {
						if(property&&property!=-1){
							params[o] = property
						}
					}
				}
			},
			selectChange (selection) {
				this.mcl_ids = []
				selection.forEach(item => {
					this.mcl_ids.push(item.mcl_id)
				})
			}
		}
	}
</script>

<style>
</style>