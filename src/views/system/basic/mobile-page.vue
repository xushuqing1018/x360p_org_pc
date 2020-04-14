<template>
	<div class="c-grid">
		<div class="box box-query">
			<label class="mr-3">标题</label>
			<Input v-model="search_field.title" placeholder="请输入标题" style="display: inline-block;width:280px;"></Input>
			
			<Button type="primary" @click="search" icon="ios-search">查询</Button>
			<Button type="primary" @click="resetSearch" icon="refresh">重置</Button>
		</div>		
		<Breadcrumb class="mb-2">
			<Icon type="ios-location"></Icon>
	        <BreadcrumbItem class="cursor" v-for="(item,index) in breadRrumb" @click.native="breadItemClick(index)">
	            {{item.label}}
	        </BreadcrumbItem>
       	</Breadcrumb>
		<div class="box box-result">
			<div class="toolbar">
				<Button type="primary" icon="plus" @click="addInfo(0)">添加</Button>
				
			</div>
			<div class="content">
				<div class="content-body">
		            <Table 
		            	ref="tableExcel"
		            	v-loading="'pages'" 
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
		<preview ref="preview"></preview>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	
	import Preview from './mobile-page/preview.vue'
	
	export default{
		mixins: [ grid,common ],
		components: {
			Preview
		},
		data () {
			return {
				rest_api: 'pages',
				pk: 'page_id',
				breadRrumb: [
					{
						uri: 'pages',
						parent_pid: 0,
						label: '全部'
					}
				],
				search_field: {
					title: ''
				},
				column_keys: {
					title: {
						title: '标题',
						show: true
					},
					thumb_url: {
						title: '缩略图',
						show: true
					},
					children_num: {
						title: '子页面',
						show: true
					}			
				},
				column_render: {
					title (h,params) {
						return h('span',{
							'class':params.row.children_num>0?'text-info cursor':'',
							on: {
								click: ()=>{
									this.openChild(params.row)
								}
							}
						},params.row.title)
					},
					thumb_url (h,params) {						
						return h('Avatar',{
							'class': params.row.thumb_url?'cursor':'',
							props: {
								shape: 'square',
								size: 'large',
								icon: 'person',
								src: params.row.thumb_url
							},
							nativeOn: {
								click: ()=>{
									if(params.row.thumb_url){
										this.picturePreview(params.row.thumb_url)										
									}
								}
							}
						})
					},
				},
				operation_keys: {
					edit:{
						title: '编辑',
						type: 'edit',
						per: 'mobile_page.edit'
					},
					add: {
						title: '添加子级',
						type: 'plus',
						per: 'mobile_page.add'
					},
					del: {
						title: '删除',
						type: 'ios-trash',
						per: 'mobile_page.delete',
						condition: 'row.children_num==0'
					},
					view: {
						title: '预览',
						type: 'eye',
						condition: 'row.is_cate==0'
					}
				},
				operation_func: {
					edit (params) {
						this.editInfo(params.row)
					},
					add (params) {
						this.addInfo(params.row.page_id)
					},
					del (params) {
						this.delInfo(params.row)
					},
					view (params) {
						this.viewInfo(params.row)
					}
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			openChild (row) {
				if(row.children_num > 0){
					this.breadRrumb.push({
						uri: 'pages',
						label: row.title,
						parent_pid: row.page_id
					})
					
					this.init_data()
				}
			},
			breadItemClick (index) {
				this.breadRrumb.splice(index+1,this.breadRrumb.length - (index + 1))
				this.init_data()
			},
			addInfo (pageId) {		
				pageId = pageId || 0			
				
				this.$Modal.open('system/basic/mobile-page/info-modal.vue',{
					on: {
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal
					.set('parent_pid',pageId)
					.show('添加','add')
				})				
			},
			editInfo (row) {
				this.$Modal.open('system/basic/mobile-page/info-modal.vue',{
					on: {
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal
					.set('info',row)
					.show('编辑页面','edit')
				})
			},
			delInfo (row) {
				let tip = util.sprintf('确定删除【%s】吗？',row.title)
				this.confirm(tip).then(()=>{
					this.delete(row)
				})
			},
			viewInfo (row) {
				this.$refs.preview
				.set('info',row)
				.show(row.title,'add')
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				params.parent_pid = this.breadRrumb[this.breadRrumb.length-1].parent_pid
				params.with_count = 'children_num'
				for(let o in search_obj) {
					let property = search_obj[o]
					
					if(property&&property!=-1){
						params[o] = property
					}
				}
			},
			resetSearch () {
				this.search_field.title = ''
				this.init_data()
			}
		}
		
	}
</script>

<style>
</style>