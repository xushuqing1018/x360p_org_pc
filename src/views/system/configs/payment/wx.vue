<template>
	<div class="c-grid">
		<div class="box box-query">
			<Button type="primary" icon="plus" @click="addInfo">添加</Button>
			<Button type="primary" icon="refresh" @click="init_data">刷新</Button>
			<Button type="primary" icon="bookmark" @click="showHost">查看授权目录</Button>
			<Button type="primary" icon="android-download" @click="showQR">静态微信支付二维码下载</Button>
		</div>
		<div class="box box-result">
			<div class="content">
				<div class="content-body"> 
					<Table
						v-loading.like="'config_pays'"
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
		<info-modal ref="info" @on-success="init_data"></info-modal>
		
		<common-modal ref="commonModal"></common-modal>
    </div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import InfoModal from './wx/info-modal.vue'
	import CommonModal from './wx/common-modal.vue'
	
	export default{
		mixins:[ grid,common,globals ],
		components: {
			InfoModal,
			CommonModal
		},
		data () {
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
					},
					operate: {
						title: '操作',
						show: true
					}
				},
				column_render: {
					type (h,params) {
						let map = {1:'微信',2:'支付宝'} 
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
					},
					operate (h,params) {
						return h('div',[
							h('Button',{
								props: {
									type: 'ghost',
									shape: 'circle',
									icon: 'edit',
									size: 'small'
								},
								on: {
									click:()=>{
										this.editInfo(params.row)
									}
								}
							}),
							h('Button',{
								class: 'ml-3',
								props: {
									type: 'ghost',
									shape: 'circle',
									icon: 'ios-trash',
									size: 'small'									
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
			hook_get_param(params) {
				params.type = 1
				
			},
			showHost () {
				this.$r('commonModal')
				.set('type','host')
				.show('授权目录','add')
			},
			showQR () {
				this.$r('commonModal')
				.set('type','qrcode')
				.show('静态二维码','add')
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
			addInfo () {
				this.$r('info').show('添加支付配置','add')
			},
			editInfo (row) {
				this.$r('info')
				.set('wx_config',row)
				.show('编辑支付配置【'+row.name+'】','edit')
			},
			delInfo (row) {				
				this.confirm('确认删除支付配置配置【'+row.name+'】？')
				.then(()=>{
					this.delete(row)	
				})
			}
		}
	}
</script>