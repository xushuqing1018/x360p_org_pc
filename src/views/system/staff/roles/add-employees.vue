<template>
	<div>
		<div class="box box-result">
            <div class="toolbar">
            	<span>[{{current_role}}]成员列表：</span>
            	<select-employee v-model="eids" style="width:30px;" @select="add_members">
            		<Button type="primary" icon="plus" v-per="'roles.add'">添加成员</Button>
            	</select-employee>
            </div>
            <div class="content">
            	<div class="content-body">
                    <Table 
                    v-loading.like="'employees'" 
                    :pageSize="pageSize" 
                    :page="pageIndex" 
                    :stripe="true" 
                    :show-header="true" 
                    :data="data" 
                    :columns="columns" 
                    :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
                    :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
                    @on-sort-change="sortChange"
                    > 
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
                        @on-page-size-change="pagesize"
                        >
                        </Page>
                    </div>
                </div>
            </div>
        </div>
	</div>
</template>
<script>

	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import util from '@/libs/util'
	import SelectEmployee from 'c%/SelectEmployee'
	export default {
		mixins: [grid,modal,common,globals],
		components: {SelectEmployee},
		props: {
			rowData: {type: Object,default() {return {}}}
		},
		data() {
			return {
				rest_api: '',
				current_role: '',
				current_rid: 0,
				eids: [],
				column_keys: {
					user: {
						title: '用户名',
						sortable: true,
						show: true
					},
					ename: {
						title: '姓名',
						sortable: true,
						show: true
					}
				},
				column_render: {
					user(h,params) {
						let name = ''
						if(params.row.user == null) {
							return h('span',{attrs: {style: 'color: #c90808'}},'未开通')
						}else{
							name = params.row.user.name
							return h('span',name)
						}
					}
				},
				operation_btn: {
                    operation(h,params) {
	                    return h('Button',{
	                     	props: {
	                     		type: 'ghost',
	                     		icon: 'trash-a',
	                     		shape: 'circle',
	                     		size: 'small',
	                     		vPer: 'employees.edit'
	                     	},
	                     	on: {
	                     		click: ()=>{
	                     			this.delete_member(params)
	                     		}
	                     	}
	                    })
	                }
                }
			}
		},
		mounted() {

		},
		methods: {
			add_members(list) {
				let len_in  = list.filter(item => this.role_members.indexOf(item) > -1).length
				let arr_out = list.filter(item => this.role_members.indexOf(item) == -1)
				if(len_in == list.length) {
					this.$Message.error('所选人员已在列表中')
					return false
				}
				this.$rest('roles').add_url_param(this.current_rid+'/employees')
				.post({eids:arr_out})
				.success(response => {
					this.init_data()
					this.eids = []
					this.$Message.success('添加成功')
				})
				.error(response => {
					this.eids = []
					this.error(response.body.message)
				})
			},
			delete_member(params) {
				this.confirm('您确定要把员工【'+params.row.ename+'】从'+this.current_role+'中移除吗?')
                .then(()=>{
                	let obj = {},
                		index = 0
                	obj = util.copy(params.row)
                	index    = obj.rids.indexOf(this.current_rid)
                	if(index > -1) {
                		obj.rids.splice(index,1)
                	}
                    this.$rest('employees').add_url_param(params.row.eid)
                    .put({employee: obj})
                    .success(response=>{
                        this.init_data()
                        this.$Message.success('删除成功!')
                        this.$store.dispatch('updateGlobalVar','employees')
                    })
                    .error(response=>{
                        this.error(response.body.message)
                    })
                })
                .catch(() => {

                })
			}
		},
		computed: {
			role_members() {
				let list = []
				this.data.forEach(item => {
					list.push(item.eid)
				})
				return list
			}
		},
		watch: {
			'rowData': {
				handler: function(data) {
					this.current_role = data.role_name
					this.current_rid  = data.rid
					this.rest_api = 'employees?rids='+this.current_rid+'&with=user',
					this.init_data()
				},
				deep: true
			}
		}
	}
</script>
<style lang="less">
</style>