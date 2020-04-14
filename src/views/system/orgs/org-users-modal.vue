<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :width="800" :mask-closable="false">
		<div class="select-list" v-if="modal$.show">
			<div class="list-condition">
				<Form class="row" ref="form" :model="search_field" :label-width="60">
					<Form-item class="col-md-6 mb-0" label="姓名" prop="name">
						<Input v-model="search_field.name" placeholder="请输入姓名"></Input>
					</Form-item>
					<Form-item class="col-md-6 mb-0" label="手机号" prop="mobile">
						<Input v-model="search_field.mobile" placeholder="请输入手机号"></Input>
					</Form-item>	
				</Form>
				<Button type="primary" icon="ios-search" size="small" @click="init_data">查询</Button>
				<Button type="primary" icon="refresh" size="small" @click="reset">重置</Button>
			</div>
			<div class="list-body">
                <div class="list-body-wrap" style="position:relative">
                	<Spin size="large" fix v-if="spinShow"></Spin>
                	<table class="modal-table">
                		<thead>
                			<th><div class="ivu-table-cell">#</div></th>
                			<th><div class="ivu-table-cell">账号</div></th>
                			<th><div class="ivu-table-cell">姓名</div></th>
                			<th><div class="ivu-table-cell">手机号</div></th>
                			<th><div class="ivu-table-cell">最后登录</div></th>
                			<th><div class="ivu-table-cell">最后ip</div></th>
                		</thead>
                		<tr v-for="(item,index) in data" :key="index">
                			<td><div class="ivu-table-cell">{{index+1}}</div></td>
                			<td>
                				<div class="ivu-table-cell">
                					{{item.account}}
                					<Button type="primary" size="small" icon="log-in" class="ml-2" v-per="'franchsystem.login'" @click="domktoken(item)">登录</Button>
                				</div>
                			</td>
                			<td>
                				<div class="ivu-table-cell">
                					<avatar-and-name :src="item.avatar" :name="item.name" :sex="item.sex"></avatar-and-name>
                				</div>
                			</td>
                			<td><div class="ivu-table-cell">{{item.mobile}}</div></td>
                			<td><div class="ivu-table-cell">{{item.last_login_time}}</div></td>
                			<td><div class="ivu-table-cell">{{item.last_login_ip||'-'}}</div></td>
                		</tr>
                		<tr v-if="!data||!data.length">
                			<td colspan="6">
                				<div class="ivu-table-cell text-center">暂无员工账号~</div>
                			</td>
                		</tr>
                	</table>
                </div>
                <div class="list-page clearfix">
                    <Page 
                    	class="pull-right" 
                    	size="small" 
                    	:total="total" 
                    	:show-total="true" 
                    	:current="pageIndex" 
                    	:show-sizer="true" 
                    	:page-size="pageSize"
                    	@on-change="pagenation" 
                    	@on-page-size-change="pagesize">
                    </Page>
                </div>
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
	import AvatarAndName from 'c%/AvatarAndName.vue'
	
	export default{
		mixins: [ grid, common, modal ],
		components: {
			AvatarAndName
		},
		data () {
			return {
				og_id: 0,
				data: [],
				rest_api: '',
				spinShow: false,
				search_field: {
					name: '',
					mobile: ''
				}
			}
		},
		watch: {
			og_id: function (val) {
				if(val){
					this.rest_api = `orgs/${val}/users?user_type=1`
					this.init_data()
				}
			}
		},
		methods: {
			domktoken (item) {
				this.$Modal.open('system/orgs/user-token-modal.vue')
				.then(modal=>{					
					modal
					.set('uid',item.uid)
					.set('og_id',this.og_id)
					.show(`登录【${item.name}】账号`)
				})
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				this.spinShow = true
                for(let o in search_obj) {
                    let property = search_obj[o]                    
                    if(!/^\s*$/.test(property)){
                        params[o] = property
                    }       
                                                   
                }
			},
			reset () {
				this.$form('form').reset()
				this.init_data()
			},
			deal_data (data) {
				setTimeout(()=>{
					this.spinShow = false					
				},500)
				return data.list
			}
		}
	}
</script>

<style>
</style>