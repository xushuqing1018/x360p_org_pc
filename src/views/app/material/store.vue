<template>
	<div class="c-grid">
		<div class="content">
			<Button class="mb-3" type="primary" icon="plus" @click="addInfo">新增</Button>
			<div class="content-body">
                <Table 
                v-loading="'lessons'" 
                :page="pageIndex" 
                :page-size="pageSize" 
                :stripe="true" 
                :show-header="true" 
                :data="data" 
                :columns="columns" 
                :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
                :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
                @on-sort-change="sortChange"> 
                </Table>
            </div>
            <div class="content-footer text-right mt-3">     
            	<Page 
                	:total="total" 
                	:current="pageIndex" 
                	:show-sizer="true" 
                	:page-size="pageSize" 
                	:show-total="true" 
                	:page-size-opts="bigPageSizeOption"
                	@on-change="pagenation" 
                	@on-page-size-change="pagesize">
                </Page>
            </div>
		</div>
		<store-info ref="info" @on-success="handleSuccess"></store-info>
	</div>
</template>

<script>
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import storeInfo from './store-info.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: { storeInfo },
		data () {
			return {
				rest_api: 'material_stores',
				pk: 'ms_id',
				column_keys: {
					name: {
						title: '仓库',
						show: true
					},
					type: {
						title: '类型',
						show: true
					},
					bids: {
						title: '关联校区',
						show: true
					},
					desc: {
						title: '描述',
						show: true
					},
					operate: {
						title: '操作',
						show: true
					}
				},
				column_render: {
					type (h,params) {
						let map = {1:'分仓库',2:'总仓库'}
						return h('span',map[params.row.type])
					},
					bids (h,params) {
						let bids = params.row.bids,
							result = ''
							
						if(bids.length>0){
							bids.forEach(b=>{
								result += this.$filter('branch_name')(b)+','
							})
							result = result.substring(0,result.length-1)
						}
						
						return h('span',result)
					},
					operate (h,params) {
						let edit = h('Button',{
								class: 'mr-3',
								props: {
									type: 'ghost',
									shape: 'circle',
									size: 'small',
									icon: 'edit'								
								},
								on: {
									click: ()=>{
										this.editInfo(params.row)
									}
								}
							}),
							del = h('Button',{
								props: {
									type: 'ghost',
									shape: 'circle',
									size: 'small',
									icon: 'ios-trash'								
								},
								on: {
									click: ()=>{
										this.delInfo(params.row)	
									}
								}
							})
						return h('div',[edit,del])
					}
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			handleSuccess () {
				this.init_data()
				this.$emit('on-success')
			},
			addInfo () {
				this.$r('info')
				.show('添加仓库','add')
			},
			editInfo (row) {
				this.$r('info')
				.set('info',row)
				.show('编辑仓库【'+row.name+'】','edit')
			},
			delInfo (row) {
				this.confirm('确定删除仓库【'+row.name+'】吗？')
				.then(()=>{
					this.delete(row).then(()=>{						
						this.$emit('on-success')
						this.$store.dispatch('updateGlobalVar','branchs')
					})
				})
			}
		}
	}
</script>
