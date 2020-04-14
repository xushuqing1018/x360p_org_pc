<template>
    <Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="1100" :mask-closable="false">
    	<div class="c-grid" style="padding:0px;">
            <div class="box box-query">
		    	<Form ref="ref_search" :model="search_field" :label-width="100" class="filter-form row">
		    		<Form-item label="点评日期" prop="create_time" class="col-md-4 col-sm-6">
		    			<date-range-picker 
		    				v-model="search_field.create_time" 
		    				label="点评日期" 
		    				placement="bottom" 
		    				style="width:100%">
		    			</date-range-picker>
		    		</Form-item>
		    	</Form>
		    	<Row class="basic">
                    <Col span="24" class="mt-2" style="margin-left:0px;">                	
                    	<Button-group>
                            <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                        </Button-group>
                    	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>    
                        <CheckboxGroup class="ml-3" style="display: inline-block;" v-model="search_field.check_status" prop="check_status">
                    		<Checkbox class="mb-0" :label="0">待审批</Checkbox>
                    		<Checkbox class="mb-0" :label="1">已通过</Checkbox>
                            <Checkbox class="mb-0" :label="2">已驳回</Checkbox>
                    	</CheckboxGroup>          		
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
    								<th width="400"><div class="ivu-table-cell">点评内容</div></th>
    								<th><div class="ivu-table-cell">点评学员</div></th>
    								<th><div class="ivu-table-cell">点评时间</div></th>
                                    <th><div class="ivu-table-cell">审核状态</div></th>
                                    <th><div class="ivu-table-cell">审核时间</div></th>
                                    <th><div class="ivu-table-cell">操作</div></th>
    	            			</tr>
    	            		</thead>
    	            		<tbody>
    	            			<tr v-for="(item,index) in data" :key="index">
    	            				<td><div class="ivu-table-cell">{{index + 1 + (pageIndex - 1) * pageSize}}</div></td>
    								<td><div class="ivu-table-cell">{{item.content}}</div></td>
    								<td><div class="ivu-table-cell">{{item.student.student_name}}</div></td>
                                    <td><div class="ivu-table-cell">{{item.create_time}}</div></td>
    								<td><div class="ivu-table-cell"><Tag :color="init_check_result_color(item.check_status)">{{init_check_result_title(item.check_status)}}</Tag></div></td>
                                    <td><div class="ivu-table-cell">{{item.check_time}}</div></td>
                                    <td>
                                        <div class="ivu-table-cell">
	                    	        	    <Button type="primary" @click="ok(item)" v-if="item.check_status == 0">通过</Button>
				                            <Button type="default" @click="del(item)" v-if="item.check_status == 0">驳回</Button>
	                    	            </div>
                                    </td>
    	            			</tr>
                                <tr v-if="data.length==0"><td colspan="7"><div class="ivu-table-cell text-center">没有数据</div></td></tr>
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
        <div slot="footer">
			<Button type="ghost" @click="cancle">关闭</Button>
		</div>
    </Modal>
</template>

<script>
	import util from '@/libs/util'
    import grid from '@/libs/grid.mixin'
    import modal from '@/libs/modal.mixin'
    import common from '@/libs/common.mixin'
    import DateRangePicker from 'c%/DateRangePicker.vue'

    const check_result_title = {0:'待审批',1:'已通过',2:'已驳回'}
	const check_result_color = {0:'default',1:'#4CAF50',2:'red'}
	
	export default{
        mixins: [ grid, modal,common ],
        components: {
			DateRangePicker
		},
        props: {
			bc_id: {
				type: Number,
				default: 0
			}
		},
		data () {
			return {
                rest_api: 'comments',
                search_field: {
                    check_status: [],
                    create_time:[]
                }
			}
        },
        computed:{
            init_check_result_title(){
                return function(check_status){
                    return check_result_title[check_status]
                }
            },
            init_check_result_color(){
                return function(check_status){
                    return check_result_color[check_status]
                }
            }
        },
		mounted () {
			this.init_data()
		},
		methods: {
            ok(item) {
				this.confirm('确定通过这条点评吗？')
				.then(() => {
                    this.$rest(`comments/${item.cmt_id}/check`)
                    .post({
                        check_status:1,
                        check_eid:this.eid$
                    })
                    .success(res => {
                        this.$Message.success('操作成功')
                        this.init_data()
                    })
                    .error(res => {
                        this.$Message.error(res.body.message)
                    })
				})
            },
            del(item) {
				this.confirm('确定驳回这条点评吗？')
				.then(() => {
                    this.$rest(`comments/${item.cmt_id}/check`)
                    .post({
                        check_status:2,
                        check_eid:this.eid$
                    })
                    .success(res => {
                        this.$Message.success('操作成功')
                        this.init_data()
                    })
                    .error(res => {
                        this.$Message.error(res.body.message)
                    })
				})
            },
            cancle(){
                this.$emit('on-success')
                this.close()
            },
            hook_get_param(params) {
                let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if(o=='create_time'){
                        if(property!=','&&property.length>0){
                            params[o] = util.sprintf('[Between,%s]',property.join(','))
                        }                                               
                    }else if (o=='check_status'){
                        if(property.length>0){
                            params[o] = util.sprintf('[In,%s]',property.join(','))
                        }
                    }
                    else{
                        if(property&&property!=-1){
                            params[o] = property    
                        }       
                    }                                   
                }

                params.app_name = 'broadcast'
                params.app_content_id = this.bc_id
                params.order_field = 'cmt_id'
                params.order_sort = 'desc'
                params.with = 'student'
            },
            resetSearch () {
                this.$form('ref_search').reset()
            }
		}
	}
</script>