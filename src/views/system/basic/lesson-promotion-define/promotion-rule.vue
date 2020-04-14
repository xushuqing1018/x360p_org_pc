<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="1000">
		<div class="mb-2">
			<Button 
				type="primary" 
				icon="plus" 
				@click="add">添加
			</Button>
			<Button 
				type="primary"
				icon="refresh"
				@click="init_data">刷新
			</Button>
			<Button 
				type="ghost" 
				size="small" 
				class="pull-right" 
				@click="show_filter=!show_filter">{{show_filter?'隐藏筛选':'显示筛选'}}
			</Button>
		</div>
		<template v-if="show_filter">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="row">
				<Form-item label="优惠名称" prop="title" class="col-sm-4 mb-1">
					<Input v-model="search_field.title" placeholder="请输入" @on-change="search"></Input>
                </Form-item>
                <Form-item label="优惠类型" prop="promotion_type" class="col-sm-4 mb-1">
					<Select v-model="search_field.promotion_type" @on-change="search">
						<Option :value="-1">不限</Option>
						<Option :value="key" v-for="(value,key) in promotion_type_list">{{value}}</Option>
					</Select>
                </Form-item>
				<Form-item label="课程" prop="suit_lids" class="col-sm-4 mb-1">
					<select-lesson 
						v-model="search_field.suit_lids" 
						clearaable 
						@selected="search"
						@on-clear="search"
						>
					</select-lesson>
                </Form-item>
                <Form-item label="科目" prop="suit_sj_ids" class="col-sm-4 mb-1">
                	<Select 
                		v-model="search_field.suit_sj_ids" 
                		clearable 
                		multiple
                		@on-change="search" 
                		@on-clear="search"
                		>
						<Option :value="item.sj_id" v-for="item in subjects">{{item.subject_name}}</Option>
					</Select>
                </Form-item>
				<Form-item label="校区" prop="suit_bids" class="col-sm-4 mb-1">
					<select-branch 
						v-model="search_field.suit_bids"
						clearable 
                		@input="search" 
						>
					</select-branch>
				</Form-item>
			</Form>
		</template>
		<div class="content-body">
	        <Table 
		        v-loading="'promotion_rules'" 
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
	        <div class="clearfix">
	            <Page 
	            	class="pull-right mt-2"
	            	size="small"
		            :total="total" 
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
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectBranch from 'c%/SelectBranch.vue'
	export default {
		mixins: [grid,common,globals,modal],
		components: {
			SelectLesson,
			SelectStudent,
			SelectBranch
		},
		data() {
			return {
				rest_api: 'promotion_rules',
				pk: 'pr_id',
				show_filter: false,
				showIndex: false,
				search_field: {
					title: '',
					promotion_type: -1,
					suit_bids: [],
					suit_lids: [],
					suit_sj_ids: [],
					status: -1
				},
				column_keys: {
					title: {
						title: '优惠名称',
						show: true
					},
					suit_obj: {
						title: '优惠对象',
						show: true
					},
					suit_bids: {
						title: '适用校区',
						show: true
					},
					promotion_type: {
						title: '优惠类型',
						show: true,
						width: 100
					},
					promotion_value: {
						title: '优惠数值',
						show: true,
						width: 100
					},
					expire_time: {
						title: '有效期',
						show: true,
						width: 150
					},
					status: {
						title: '状态',
						show: true,
						width: 100
					}
				},
				column_render: {
					suit_obj(h,params) {
						let obj = []
						let lids = params.row.suit_lids
						let sj_ids = params.row.suit_sj_ids
						if(sj_ids.length>0) {
							sj_ids.forEach(id => {
								obj.push(h('div',this.$filter('subject_name')(id)))
							})
						}else if(lids.length>0) {
							lids.forEach(id => {
								obj.push(h('div',this.$filter('lesson_name')(id)))
							})
						}
						return h('div',obj)
					},
					suit_bids(h,params) {
						let result = ''
						if(params.row.is_public) {
							result = '所有校区'
						}else{
							let branch = []
							params.row.suit_bids.forEach(bid => {
								branch.push(h('div',this.$filter('branch_name')(bid)))
							})
							result = branch
						}
						return h('span',result)
					},
					promotion_value(h,params) {
						let divs = []
						let result = Number(params.row.promotion_value)
						let present = Number(params.row.present_lesson_hours)
						let type = params.row.promotion_type
						if(type==1) {
							result = result + '%'
						}else if(type==2) {
							result = `满${Number(params.row.valve)}元减${result}元`
						}else if(type==3){
							result = result + '元'
						}else{
							result = result + '个'
						}
						divs.push(h('p',result))
						if(params.row.promotion_type < 4&&present > 0) {
							divs.push(h('p','加赠'+present+'课时'))
						}
						return h('div',divs)
					},
					promotion_type(h,params) {
						return h('span',this.$filter('promotion')(params.row.promotion_type))
					},
					expire_time(h,params) {
						return h('span',[h('p',params.row.start_time), h('p','至'), h('p',params.row.end_time)])
					},
					status(h,params) {
						return h('i-switch',{
    						props: {
    							trueValue: 1,
    							falseValue: 0,
    							value: params.row.status
    						},
    						on: {
    							click:() => {
    								let info = util.copy(params.row)
    								console.log(info)
    								info.status = info.status==1?0:1
    								this.$rest('promotion_rules')
    								.put(info)
    								.success(res => {
    									this.$Message.success('操作成功')
    									this.init_data()
    								})
    								.error(res => {
    									this.$Message.error(res.body.message)
    								})
    							}
    						}
    					})
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
					edit(params) {
						let info = util.copy(params.row)
						info.promotion_value = Number(info.promotion_value)
						this.$Modal.open('system/basic/lesson-promotion-define/info-modal.vue',{
							on: {
								save:() => {
									this.init_data()
								}
							}
						})
						.then(modal => {
							modal
							.set('info',info)
							.show('编辑优惠规则','edit')
						})
					},
					delete(params) {
						this.confirm('确定删除吗？')
						.then(() => {
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
			add() {
				this.$Modal.open('system/basic/lesson-promotion-define/info-modal.vue',{
					on: {
						save:() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('添加促销规则','add')
				})
			},
			hook_get_param(params) {
				let search_obj = util.copy(this.search_field)				
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o == 'suit_sj_ids' || o == 'suit_lids' || o == 'suit_bids') {
						if(property.length>0) {
							params[o] = property.join(',')
						}
					}else{
						if(property&&property!=-1){
							params[o] = property
						}
					}
				}
			}
		},
		computed: {
			subjects() {
				return this.$store.state.gvars.subjects
			}
		}
	}
</script>