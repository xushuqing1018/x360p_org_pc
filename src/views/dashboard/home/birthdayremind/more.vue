<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="700" :mask-closable="false">
		<template v-if="modal$.show">
			<div class="px-0 py-2">
				<Form ref="ref_search" :model="search_field" :label-width="60" class="filter-form row">
					<Form-item label="姓名" prop="name" class="col-sm-4">
						<Input v-model="search_field.name" placeholder="请输入姓名"></Input>
					</Form-item>
					<Form-item label="月份" prop="month" class="col-sm-4">
						<Select v-model="search_field.month">
							<Option :value="0">今日</Option>
							<Option :value="item" v-for="item in 12">{{item}}月</Option>
						</Select>
					</Form-item>
					<Form-item label="类型" prop="type" class="col">
						<Select v-model="search_field.type">
							<Option value="student">学员</Option>
							<Option value="employee">员工</Option>
						</Select>
					</Form-item>
				</Form>
				<Row class="basic">
		            <Col span="24" class="mt-2" style="margin-left:0px;">                	
		            	<Button type="primary" size="small" @click="search" icon="ios-search">查询</Button>
		            	<Button type="primary" size="small" icon="refresh" @click="resetSearch">重置</Button>
                    	<export-button size="small" res="birthday_reminds" :params="params"></export-button>
		            </Col>
		        </Row>
		    </div>
	        <div class="cast-record clearfix">
	        	<div class="mt-2">
					<Table 
			        	v-loading.like="'birthday_remind'" 
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
			    <div class="pull-right">
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
		</template>
		<div slot="footer">
			<Button type="ghost" @click="modal$.show=false">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import modal 	 from '@/libs/modal.mixin'
	import grid 	 from '@/libs/grid.mixin'
	import common 	 from '@/libs/common.mixin'
	import globals 	 from '@/libs/globals.mixin'
	import util 	 from '@/libs/util'
	import ExportButton from 'c%/ExportButton.vue'
	export default{
		mixins: [modal,grid,common,globals],
		components: {
            ExportButton
		},
		data () {
			return {
				rest_api: '',
				search_field: {
					name: '',
					type: 'student',
					month: new Date().getMonth()+1
				},
				column_keys: {
					name: {
						title: '姓名',
						show: true,
					},
					role: {
						title: '角色',
						show: true
					},
					age: {
						title: '年龄',
						show: true
					},
					birth_time: {
						title: '生日',
						show: true
					}
				},
				column_render: {
					name(h, params) {
						let name = params.row.student_name || params.row.ename
						let map = {0:{icon:'help'},1:{icon:'male'},2:{icon:'female'}}
						return h('span',[h('Icon',{
							props: {
								type: map[params.row.sex].icon
							}
						}),' '+name] )
					},
					role(h, params) {
						if(params.row.eid) {
							let roles = []
							params.row.rids.forEach(item => {
								roles.push(this.$filter('role_name')(item))
							})
							return h('span', roles.join(',').toString())
						}else{
							return h('span', '学员')
						}
					},
					age(h,params) {
						return h('span',util.age(params.row.birth_time))
					}
				}
			}
		},
		methods: {
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(property){
						params[o] = property
					}
				}
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			init() {
				this.rest_api = 'dashboard/birthday_remind'
				this.init_data()
				return this
			}
		},
		watch: {
			'modal$.show': {
				handler: function(val) {
					if(val) {
						
					}else{
						this.$form('ref_search').reset()
					}
				}
			}
		}	
	}
</script>
<style lang="less" scoped>
	.cast-record {
		.ivu-btn {
			padding: 2px 7px;
		}
	}
</style>