<template>
	<div class="c-grid">
		<div class="box box-query">
			<Button type="primary" icon="plus" @click="addInfo">添加微信模板</Button>
		</div>
		<div class="box box-result">
			<div class="content">
				<div class="content-body"> 
					<Table
						v-loading.like="'wechat_tpl_defines'"
		            	ref="tableExcel"
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
	
	
	export default{
		mixins:[ grid,common,globals ],
		data () {
			return {
				rest_api: 'wechat_tpl_defines',
				pk: 'wtd_id',
				column_keys: {
					name: {
						title: '模板名称',
						show: true
					},
					operate: {
						title: '操作',
						show: true,
						width: 180
					}
				},
				column_render: {
					operate (h,params) {
						return h('div',[
							h('Button',{
								class: 'ml-2',
								props: {
									type: 'ghost',
									shape: 'circle',
									icon: 'edit',
									size: 'small'
								},
								attrs: {
									title: '编辑'
								},
								on: {
									click:()=>{
										this.editInfo(params.row)
									}
								}
							}),
							h('Button',{
								class: 'ml-2',
								props: {
									type: 'ghost',
									shape: 'circle',
									icon: 'ios-trash',
									size: 'small'								
								},
								attrs: {
									title: '删除'
								},
								on: {
									click:()=>{
										this.delInfo(params.row)
									}
								}
							}),
						])
					}
				}				
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			addInfo () {
				this.$Modal.open('system/configs/wechat/info-modal.vue',{
					on:{
						save:()=>{
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.vuec.show('添加微信消息模板','add')
				})
			},
			editInfo (row) {
				this.$Modal.open('system/configs/wechat/info-modal.vue',{
					on:{
						save:()=>{
							this.init_data()
						}
					}
				})
				.then(modal => {
					let info = util.copy(row)
					modal.vuec
					.set('action','')
					.set('info',info)
					.show(util.sprintf('编辑微信消息模板【%s】',row.name),'edit')
				})
			},
			delInfo (row) {				
				this.confirm(util.sprintf('确认删除模板【%s】吗？',row.name))
				.then(()=>{
					this.delete(row)	
				})
			}
		}
	}
</script>