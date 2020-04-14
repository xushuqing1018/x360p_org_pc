<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="知识标题" prop="title" class="col-md-3 col-sm-6">
					<Input v-model="search_field.title" clearable placeholder="请输入标题"></Input>
				</Form-item>
				<Form-item label="知识类型" prop="ktype_did" class="col-md-3 col-sm-6">
					<Select v-model="search_field.ktype_did" clearable>
						<Option :value="item.did" v-for="item in dicts('knowlege_type')">{{item.title}}</Option>
					</Select>
				</Form-item>
				<Form-item label="关键词" prop="keywords" class="col-md-3 col-sm-6">
					<Input v-model="search_field.keywords" clearable placeholder="请输入关键词"></Input>
				</Form-item>
				<Form-item label="相关页面" prop="router_uri" class="col-md-3 col-sm-6">
					<Input v-model="search_field.router_uri" clearable placeholder="请输入页面路由"></Input>
				</Form-item>
				<template v-if="searchExpand">
					<Form-item label="创建日期" prop="create_time" class="col-md-3 col-sm-6">
						<date-range-picker 
							v-model="search_field.create_time" 
							@on-change="search" 
							placement="right-start" 
							style="width: 100%">
						</date-range-picker>
					</Form-item>
					<Form-item label="创建人" prop="create_uid" class="col-md-3 col-sm-6">
	    				<select-employee mode="user" v-model="search_field.create_uid" :clearable="true"></select-employee>
	    			</Form-item>
	    		</template>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
                </Col>
          	</Row>
		</div>
		<div class="box box-result">
			 <div class="toolbar">
	        	<filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
	        	<div class="content-body">
		            <Table 		            	
		            	v-loading.like="'knowledge_items'" 
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
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import SelectEmployee  from 'c%/SelectEmployee.vue' 
	export default {
		mixins: [common,globals,grid],
		components: {
			DateRangePicker,
			SelectEmployee
		},
		data() {
			return {
				rest_api: 'knowledge_items',
				pk: 'ki_id',
				search_field: {
					name: '',
					ktype_did: 0,
					keywords: '',
					router_uri: '',
					create_time: [],
					create_uid: 0
				},
				column_keys: {
					title: {
						title: '知识标题',
						show: true
					},
					ktype_did: {
						title: '知识类型',
						show: true
					},
					keywords: {
						title: '关键词',
						show: true
					},
					router_uri: {
						title: '相关页面',
						show: true
					},
					stars: {
						title: '点赞数',
						show: true,
						sortable: 'custom'
					},
					create_time: {
						title: '创建日期',
						show: true,
						sortable: 'custom'
					},
					create_employee_name: {
						title: '创建人',
						show: true
					}
				},
				column_render: {
					ktype_did(h,params) {
						return h('span',this.$filter('dict_title')(params.row.ktype_did,'knowlege_type'))
					},
					keywords(h,params) {
						return h('span',params.row.keywords.join(','))
					},
					stars(h,params) {
						let heart = h('Icon',{
							props: {
								type: 'ios-heart',
								size: 14,
								color: params.row.stars>0?'#f30':'#5c6b77'
							}
						})
						return h('span',[heart,'  ',params.row.stars])
					},
					create_time(h,params) {
						return h('span',moment(params.row.create_time).format('YYYY-MM-DD'))
					}
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'knowledge.edit'
					},
					like: {
						title: '点赞',
						type: 'heart',
						condition: 'row.my_like==null'
					},
					unlike: {
						title: '取消点赞',
						type: 'heart-broken',
						condition: 'row.my_like!=null'
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'knowledge.delete'
					}
				},
				operation_func: {
					edit(params) {
						let info = util.copy(params.row)
						this.$Modal.open('common/aside/kl-info-modal.vue',{
							autoShow:false,
							on: {
								save:()=>{
									this.init_data()
								}
							}
						})
						.then(modal => {
							modal.vuec
							.set('info',info)
							.show('编辑知识库','edit')
						})
					},
					delete(params) {
						this.confirm('确定删除这条知识吗？')
						.then(() => {
							this.delete(params.row)
						})
					},
					like(params) {
						this.$rest('knowledge_items').add_url_param(params.row.ki_id,'my_like')
						.post({
							eid: this.eid$
						})
						.success(res => {
							this.$Message.success('点赞成功')
							this.init_data()
						})
						.error(res => {
							this.$Message.error(res.body.message)
						})
					},
					unlike(params) {
						this.$rest('knowledge_items')
						.delete(params.row.ki_id+'/my_like',{params:{eid:this.eid$}})
						.success(res => {
							this.$Message.success('取消点赞成功')
							this.init_data()
						})
						.error(res => {
							this.error(res.body.message)
						})
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
	        hook_get_param(params){
	       		let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{		
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
				params.with_my_like = 1
	        },
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		}
	}
</script>