<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="产品名称" class="col-sm-3" prop="name">
					<Input v-model="search_field.name" placeholder="请输入产品名称"></Input>
				</Form-item>
				<Form-item label="商品类型" class="col-sm-3" prop="gtype">
					<Select v-model="search_field.gtype" placeholder="请选择">
				        <Option value="0">课程</Option>
						<Option value="1">班级</Option>
                        <Option value="2">物品</Option>
						<!-- <Option value="3">杂费条目</Option>
						<Option value="4">储值卡</Option> -->
				    </Select>
				</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>           
					<Button type="default" icon="status" @click="productCateInfo">分类管理</Button>    		
                </Col>
           </Row>	
		</div>		
		<div class="box box-result">
			<div class="toolbar">
				<Button class="ml-2" type="primary" icon="plus" @click="addInfo">添加产品</Button>
			</div>
			<div class="content">
				<div class="content-body">
		            <Table 
		            	ref="tableExcel"
		            	v-loading="'product'" 
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

	import TagLabel from 'c%/TagLabel.vue'
	
	const gtype_title = {0:'课程',1:'班级',2:'物品',3:'杂费条目',4:'储值卡'}
		
	export default{
        mixins: [ grid, common, globals ],
		data () {
			return {
				rest_api: 'products',
				pk: 'pid',				
				search_field: {
					name: '',
					gtype: 0
                },
				column_keys: {
					name: {
						title: '产品名称',
						show: true,
						width: 400
					},
					cate_name: {
						title: '产品分类',
						show: true,
						width: 100
					},
					desc: {
						title: '描述',
						show: true,
						width: 300
					},
					share_title: {
						title: '微信分享标题',
						show: true
					},
					share_img_url: {
						title: '微信分享图片',
						show: true
					},
                    view_times: {
						title: '查看次数',
						show: true
                    },
                    int_day: {
						title: '有效日期',
						show: true
                    }
				},
				column_render: {
                    name (h, params) {
						return h('div',{
							attrs: {
								class: 'pt-2 pb-2'
							}
						},
						[
							h('div',{
								attrs: {
									class: 'pt-2 pb-2'
								},
								style:{
									float:'left'
								}
							},
							[
								h('img',{
									attrs:{
										src: params.row.cover_img_url,
										width:60,
										height:60
									},
									on: {
										click:()=>{
											this.picturePreview(params.row.cover_img_url)
										}
									}
								})		
							]),
							h('div',{
								attrs: {
									class: 'pt-2 pb-2'
								},
								style:{
									'padding-left': '70px'
								}
							},
							[
								h('p',[
									h('span',`名称: ${params.row.name}`),
									h(TagLabel, {
                            		    props: {
                            		        list: params.row.tags,
                            		        type: 5,
                            		        id: params.row.pid,
                            		        objName: params.row.name
                            		    },
                            		    style: {
                            		        marginLeft: '5px'
                            		    },
                            		    on: {
                            		        update: () => {
                            		            this.init_data()
                            		        }
                            		    }
                            		})
								]),
								h('p',`类型: ${gtype_title[params.row.gtype]}【${params.row.gtype == 0 ? this.$filter('lesson_name')(params.row.lid) : params.row.gtype == 1 ? params.row.classes.class_name : params.row.material.name}】`),
								h('p',[
									h('span','价格:'),
									h('span',{
										attrs:{
											title:'原价'
										},
										style:{
											'text-decoration':'line-through',
											'color':'red'
										}
									},' ' + params.row.origin_price),
									h('span',{
										attrs:{
											title:'价格'
										},
										style:{
											'color':'green'
										}
									},' ' + params.row.price)
								])	
							])		
						])
					},
					cate_name(h,params){
						return h('span',params.row.product_cate.cate_name)
					},
					int_day(h,params){
						let int_day_info
						if (params.row.start_int_day == 0 && params.row.end_int_day == 0) {
							int_day_info = '永久有效'
						}else{
							let start_int_day = params.row.start_int_day == 0 ? '~' : this.$filter('int_date')(params.row.start_int_day)
							let end_int_day = params.row.end_int_day == 0 ? '~' : this.$filter('int_date')(params.row.end_int_day)
							int_day_info = start_int_day + ' 至 ' + end_int_day
						}
						
						return h('span',int_day_info)
					},
					share_img_url(h,params){
						if (params.row.share_img_url != '') {
							return h('img',{
								attrs:{
									src: params.row.share_img_url,
									width:60,
									height:60
								},
								on: {
									click:()=>{
										this.picturePreview(params.row.share_img_url)
									}
								}
							})
						}
					}
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit'
					},
					delete: {
						title: '删除',
						type: 'ios-trash'
					}
				},
				operation_func: {
					edit (params) {
						this.editInfo(params.row)
					},
					delete (params) {
						this.deleteInfo(params.row)
					}
				}
			}
		},		
		mounted () {
            this.init_data()
		},
		methods: {
			editInfo (row) {
				row.gtype = row.gtype + ''
				row.start_int_day = row.start_int_day == 0 ? '' : this.$filter('int_date')(row.start_int_day)
				row.end_int_day = row.end_int_day == 0 ? '' : this.$filter('int_date')(row.end_int_day)
				row.origin_price = parseFloat(row.origin_price)
				row.price = parseFloat(row.price)

				this.$Modal.open('business/order/online/product-info-modal.vue',{
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal
					.set('info',row)
					.show('编辑产品','edit')
				})
			},
			deleteInfo (row){
				this.$Modal.confirm({
					content: `确认要删除【${row.name}】产品吗？`,
					onOk: ()=> {
						this.$http.delete('products/' + row.pid)
						.then(res => {
							this.$Message.success('删除成功');
							this.init_data();
						},res => {
							this.error(res.body.message);
						})
					}
				})
			},
			resetSearch () {
                this.$r('ref_search').resetFields()
                this.init_data()
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if(property&&property!=-1){
                        params[o] = property    
                    }                                    
				}
				params.with = 'classes,material,product_cate'
			},
			addInfo () {
				this.$Modal.open('business/order/online/product-info-modal.vue',{
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('添加产品','add')
				})
			},
			productCateInfo(){
				this.$Modal.open('business/order/online/product-cate-modal.vue',{
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('产品分类管理')
				})
			}
		}
	}
</script>