<template>
    <div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="公告标题" prop="title" class="col-sm-4">
					<Input v-model="search_field.title" @on-enter="search" clearable placeholder="请输入公告标题"></Input>
				</Form-item>
				<Form-item label="类型" prop="type" class="col-sm-4">
		            <Select v-model="search_field.type" clearable>
		            	<Option :value="0">不限</Option>
		            	<Option :value="1">内部</Option>
		            	<Option :value="2">外部</Option>
                        <Option :value="3">游客</Option>
		            </Select>
				</Form-item>
                <Form-item label="公告类型" prop="bc_type" class="col-sm-4">
		            <Select v-model="search_field.bc_type" clearable>
						<Option :value="-1">不限</Option>
		            	<Option :value="0">通知</Option>
		            	<Option :value="1">文章</Option>
		            	<Option :value="2">视频</Option>
                        <Option :value="3">语音播报</Option>
		            </Select>
				</Form-item>
			</Form>
            <Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>        
                    <Checkbox v-model="search_field.is_no_check">待审核</Checkbox>      		
                </Col>
           </Row>	
		</div>
	    <div class="box box-result">
			<div class="content">
				<div class="content-body">
				    <table class="modal-table">
	            		<thead>
	            			<tr>
	            				<th><div class="ivu-table-cell">#</div></th>
	            				<th><div class="ivu-table-cell">标题</div></th>
								<th><div class="ivu-table-cell">类型</div></th>
								<th><div class="ivu-table-cell">公告类型	</div></th>
	            				<th><div class="ivu-table-cell">发布时间</div></th>
								<th><div class="ivu-table-cell">发布人</div></th>
                                <th><div class="ivu-table-cell">操作</div></th>
	            			</tr>
	            		</thead>
	            		<tbody>
	            			<tr v-for="(item,index) in data" :key="index">
	            				<td><div class="ivu-table-cell">{{index + 1 + (pageIndex - 1) * pageSize}}</div></td>
	            				<td><div class="ivu-table-cell">{{item.title}}</div></td>
								<td><div class="ivu-table-cell">{{init_type(item.type)}}</div></td>
								<td><div class="ivu-table-cell">{{init_bc_type(item.bc_type)}}</div></td>
								<td><div class="ivu-table-cell">{{item.create_time}}</div></td>
                                <td><div class="ivu-table-cell">{{item.user.name}}</div></td>
								<td>
									<Badge :count="item.check_comment.length">
    									<Button @click="showCheckModal(item)">点评审核</Button>
    								</Badge>
								</td>
	            			</tr>
	            			<tr v-if="data.length == 0">
	            				<td colspan="7" align="center"><div class="ivu-table-cell">没有数据</div></td>
	            			</tr>
	            		</tbody>
	            	</table>
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
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
    import util from '@/libs/util'

	export default{
		mixins: [grid,common],
		data () {
			return {
				rest_api: 'broadcasts/get_check_list',
                pk:'bc_id',
				search_field: {
					title: '',
                    type: 0,
                    bc_type: -1,
                    is_no_check: true
				}
			}
        },	
        computed:{
            init_type() {
                return function(type){
                    let map = {1:'内部',2:'外部',3:'游客'}
				    return map[type]
                }
            },
            init_bc_type() {
                return function(bc_type){
                    let map = {0:'通知',1:'文章',2:'视频',3:'语音播报'}
				    return map[bc_type]
                }
			}
        },
		mounted () {
			this.init_data()
		},
		methods: {
			showCheckModal (item) {
				this.$Modal.open('app/broadcast/check-modal.vue',{
					props:{
                        bc_id:item.bc_id
                    },
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('审批【'+item.title+'】点评')
				})
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o == 'bc_type'){
						if(property != -1){
							params[o] = property
						}
					}else{
						if(property){
							params[o] = property
						}
					}
					
				}
				params.with = 'user'
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
			}
		}	
	}
</script>
<style lang="less">
	.cast-record {
		.ivu-btn {
			padding: 2px 7px;
		}
	}
</style>