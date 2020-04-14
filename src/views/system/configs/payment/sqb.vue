<template>
	<div class="c-grid">
		<div class="box box-query">
			<Button type="primary" icon="plus" @click="addSqbInfo">添加配置</Button>
			<Button type="primary" icon="wrench" @click="sqbApplay">收钱吧申请</Button>
			<Button type="primary" icon="refresh" @click="init_data">刷新</Button>
		</div>
		<div class="box box-result">
			<div class="content">
				<div class="content-body"> 
					<Table
						v-loading.like="'config_pay'"
		            	:data="data" 
		            	:stripe="true" 
		            	:page="pageIndex" 
		            	:columns="columns" 
		            	:show-header="true" 
		            	:page-size="pageSize" 
		            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		            	@on-sort-change="sortChange">						
					</Table>
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

	export default {
		mixins: [grid,common,globals],
		data() {
			return {
				rest_api: 'config_pays',
				pk: 'cp_id',
				column_keys: {
					name: {
						title: '支付配置名',
						show: true
					},
					type: {
						title: '支付类型',
						show: true
					},
					aa_id: {
						title: '绑定账户',
						show: true
					},
					is_enable: {
						title: '是否启用',
						show: true
					}
				},
				column_render: {
					type (h,params) {
						let map = {1:'微信',2:'支付宝',3:'收钱吧'} 
						return h('span',map[params.row.type])
					},
					aa_id (h,params) {
						return h('span',this.getAccountName(params.row.aa_id))
					},
					is_enable(h,params) {
						return h('i-switch',{
							props: {
								value: params.row.is_enable,
								readonly: true,
								trueValue: 1,
								falseValue: 0
							},
							on: {
								click: ()=>{
									this.enableAndDisable(params.row)
								}
							}
						})
					}
				},
				operation_keys: {
					active: {
						title: '激活',
						type: 'android-done',
						per: 'sqb.configactive'
					},
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'sqb.configedit'
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'sqb.configdelete'
					}
				},
				operation_func: {
					active(params) {
						this.active(params.row)
					},
					edit(params) {
						this.editSqb(params.row)
					},
					delete(params) {
						this.confirm('确认删除支付配置配置【'+params.row.name+'】？')
						.then(()=>{
							this.delete(params.row)	
						})
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			sqbApplay() {
				this.$rest('shou_qian_bas')
				.get()
				.success(res => {
					if(res.list.length != 0) {
						this.openApplayModal(true,res.list[0]);
					}
					else {
						this.openApplayModal(false,{});
					}
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			openApplayModal(hasAplay,info) {
				this.$Modal.open('system/configs/payment/sqb/apply-modal.vue')
				.then(modal=>{
					modal
					.set('info',info)
					.set('hasAplay',hasAplay)
					.show('收钱吧申请','edit')
				})
			},
			addSqbInfo() {
				this.$Modal.open('system/configs/payment/sqb/info-modal.vue',{
					on: {
						success: () => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('添加收钱吧配置','add')
				})
			},
			editSqb(row) {
				this.$Modal.open('system/configs/payment/sqb/info-modal.vue',{
					on: {
						success: () => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal
					.set('sqb_config',row)
					.show('编辑收钱吧配置','edit')
				})
			},
			active(row) {
				this.$Modal.open('system/configs/payment/sqb/active-modal.vue',{
					props: {
						data: row
					},
					on: {
						success:() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('激活收钱吧')
				})
			},
			enableAndDisable (row) {
				let operate = row.is_enable?'禁用':'启用'
				let tip = util.sprintf('确定%s支付配置【%s】吗？',operate,row.name)
				
				this.confirm(tip)
				.then(()=>{
					row.is_enable = row.is_enable?0:1
					this.$rest('config_pays/'+row.cp_id)
					.put(row)
					.success(data=>{
						this.$Message.success('操作成功！')
						this.init_data()
					})
				})
			},
			getAccountName (aa_id) {
				let list = this.$store.state.gvars.accounts
				let obj = list.find(l=>l.aa_id==aa_id)
				if(obj){
					return obj.name
				}
				return ''
			},
			hook_get_param(params) {
				params.type = 3
				
			}
		}
	}
</script>