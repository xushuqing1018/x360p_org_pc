<template>
	<div class="c-grid">
		<div class="box box-result">
			<Button type="primary" icon="plus" @click="addInfo" class="mb-3" v-per="'cardtype.add'">
				添加会员卡
			</Button>
			<div class="content">
				 <div class="content-body">
	                <Table 
	                    v-loading="'card_types'"
	                    :page-size="pageSize" 
	                    :page="pageIndex"
	                    :stripe="true" 
	                    :show-header="true" 
	                    :data="data" 
	                    :columns="columns" 
	                    :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
	                    :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
	                    @on-sort-change="sortChange"> 
		                </Table>
		            </div>
		            <div class="content-footer">
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
		mixins: [grid,common,globals],
		data () {
			return {
				rest_api: 'card_types',
				pk: 'ct_id',
				column_keys: {
					card_name: {
						title: '会员卡名称',
						show: true
					},
					card_max_level: {
						title: '最大等级',
						show: true
					},
					card_define: {
						title: '会员卡定义',
						show: true
					},
					card_bg_url: {
						title: '卡片背景图',
						show: true
					},
					operate: {
						title: '操作',
						show: true,
						width: 150
					}
				},
				column_render:{
					card_define (h,params) {
						let divs = []
						let style = {
							width: '100px',
							display: 'inline-block'
						}
						let levels = params.row.card_define
						divs.push(h('div',[
							h('span',{
								style:style
							},'用户身份')]))
						levels.forEach(l => {
							divs.push(h('div',[
								h('span',{
									style:style
								},l.name)
								]))
						})
						return h('div',{
							style: {
								minWidth: '300px',
								margin: '6px 0'
							}
						},divs)
					},
					card_bg_url (h,params) {
						return h('img',{
							attrs: {
								src: params.row.card_bg_url,
								width: '150px'
							},
							style: {
								margin: '6px 0'
							}
						})
					},
					operate (h,params) {
						let edit = h('Button',{
								class: 'mr-2',
								props: {
									type: 'text',
									size: 'small',
									icon: 'edit'								
								},
								directives: [{
									name:'per',
									value:'cardtype.edit'
								}],
								on: {
									click: ()=>{
										this.editInfo(params.row)
									}
								}
							}),
							del = h('Button',{
								props: {
									type: 'text',
									size: 'small',
									icon: 'ios-trash'								
								},
								directives: [{
									name:'per',
									value:'cardtype.delete'
								}],
								on: {
									click: ()=>{
										this.delInfo(params.row)	
									}
								}
							})
						return h('div',[edit,del])
					}
				},
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {			
			addInfo () {
				this.$Modal.open('system/configs/cardtype/info-modal.vue',{
					on: {
						'save':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('添加会员卡','add')
				})
			},
			editInfo (row) {				
				this.$Modal.open('system/configs/cardtype/info-modal.vue',{
					on: {
						'save':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal
					.set('info',util.copy(row))
					.show(util.sprintf('编辑会员卡【%s】',row.card_name),'edit')
				})
			},
			delInfo (row) {
				this.confirm(util.sprintf('确定删除会员卡【%s】',row.card_name))
				.then(() => {
					this.delete(row)
				})
			}
		}
	}
</script>
