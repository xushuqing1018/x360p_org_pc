<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :width="700" :mask-closable="false">
		<Form :label-width="100" label-position="right" ref="form" :model="info" v-if="modal$.show">		
			<div>	
                <Row>
					<Col>
						<Form-item label="流程类型">
							<Select v-model="info.ft_id" placeholder="请选择流程类型" @on-change="select_flow_type()">
				            	<Option :value="item.ft_id" v-for="(item,index) in flow_type_list" :key="index">{{item.ft_name}}</Option>
				            </Select>
						</Form-item>
					</Col>
				</Row>		
                <Row>
                    <Col>
                        <Form-item label="流程标题" prop="flow_title">
                        	<Input v-model="info.flow_title" placeholder="请输入流程标题"></Input>
				        </Form-item>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form-item label="流程描述" prop="flow_desc">
                            <Input type="textarea" v-model="info.flow_desc" :autosize="{minRows:2,maxRows:5}" placeholder="请输入流程描述"></Input>
                        </Form-item>
                    </Col>
                </Row>	
				
                <Row v-if="info.ft_id != 0">
					<Col>
						<Form-item label="审批流程" class="form-item-step-class">
							<Steps :current="0" :direction="flow_type_with_step_info.flow_type_step.length > 4 ? 'vertical' : 'horizontal'">
                                <Step :title="item.step == 1 ? '进行中' : '待进行'" :content="item.step_name" v-for="(item,index) in flow_type_with_step_info.flow_type_step" :key="index">
                                    <div v-if="item.step == 1" class="ivu-steps-content" style="padding-bottom:10px;">{{item.step_name}}</div>
                                    <Select v-model="check_eid" placeholder="请选择审批人" v-if="item.step == 1" style="width:140px;">
							    	    <Option :value="item.eid" v-for="(item,index) in filter_employees(item.eids)" :key="index">{{item.ename}}</Option>
							        </Select>
                                    <CheckboxGroup v-model="allow_free" class="ml-3" style="margin-left: 0px !important;margin-top: 10px;" v-if="item.step == 1 && item.allow_free">
                	                	<Checkbox class="mb-0" :label="1">自由选择</Checkbox>
                	                </CheckboxGroup>
                                </Step>
                            </Steps>
						</Form-item>
					</Col>
				</Row>
			</div>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
    import common from '@/libs/common.mixin'
    import globals from '@/libs/globals.mixin'
    import store from '@/store'
	
    import SelectEmployee from 'c%/SelectEmployee.vue'

    const limit_type_title = {0:'无限制',1:'按角色',2:'按部门',10:'指定员工'}
	
	export default{
		mixins: [ modal, common,globals ],
		components: {
            SelectEmployee
        },
        props: {
			ft_id: {
            	type: Number,
            	default: 0
            },
            flow_check_eid: {
            	type: Number,
            	default: 0
            }
        },
		data () {
			return {
				info: {
                    ft_id: this.ft_id,
                    fs_id: 1,
                    flow_title: '',
    				flow_desc: '',
    				start_eid: 0,
    				start_bid: 0,
                    flow_step: []
                },
                flow_type_list:[],
                flow_type_with_step_info:{
                    flow_type_step: []
                },
                employees: store.state.gvars.employees||[],
                allow_free: [],
                check_eid: this.flow_check_eid
			}
        },
        computed: {
            filter_employees() {
                return function(eids) {
                    if (eids.length > 0 & this.allow_free[0] != 1) {
                        return this.employees.filter(item => eids.indexOf(item.eid) > -1)
                    }
                    return this.employees
                }   
            }
        },
        filters: {
            limit_type: function (value) {
                return limit_type_title[value]
            }
        },
		mounted () {
			this.init_data()
		},
		methods: {
            init_data(){
                this.$rest('flow_types?order_field=ft_name&order_sort=asc').get()
				.success(data=>{
					this.flow_type_list = data.list
                })
                this.select_flow_type()
            },
            select_flow_type (){
                this.$rest('flow_types/' + this.info.ft_id).get()
				.success(data=>{
                    if (data.flow_step_type == 0) {
                        data.ft_id = 0
                        data.flow_type_step = [{
                            step:1,
                            step_name: '步骤一',
                            limit_type:0,
                            allow_free: 0,
                            eids: [],
                            fts_id: 0
                        }]
                    }
                    this.flow_type_with_step_info = data
				})
            },
			ok () {
                
                if(this.info.ft_id == 0){
                    this.$Message.error('请选择流程类型')
					return
                }
				if(/^\s*$/.test(this.info.flow_title)){
					this.$Message.error('请输入流程标题')
					return
                }

                if(this.check_eid == 0){
                    this.$Message.error('请选择审核人')
					return
                }
                
                if(!this.flow_type_with_step_info.is_limit){
                    this.$Message.error('无【'+this.flow_type_with_step_info.ft_name+'】流程类型使用权限')
					return
                }

                let flow_step = []
                this.flow_type_with_step_info.flow_type_step.forEach(data=>{
                    let flow_step_item = {
                        og_id:this.og_id$,
                        ft_id: this.info.ft_id,
                        flow_step: data.step,
                        check_eid: data.step == 1 ? this.check_eid : 0,
                        fts_id : data.fts_id
                    }
                    flow_step.push(flow_step_item)
                })

                this.info.flow_step = flow_step
                this.info.start_eid = this.eid$
                this.info.start_bid = this.bid$
				
				let [uri,method,msg] = this.modal$.action=='add'?['flows','post','发起成功，请等待审核']:['flows/'+this.info.fid,'put','修改成功']
				
				this.$rest(uri)[method](this.info)
				.success(data=>{
					this.$Message.success(msg)
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'操作失败~')
				})
            }
		}
		
	}
</script>

<style>
    .form-item-step-class .ivu-steps-vertical .ivu-steps-main {
        min-height: 47px;
        overflow: visible;
        display: block;
        margin-left: 40px;
    }
    
    .form-item-step-class .ivu-steps-horizontal .ivu-select-dropdown{
        top:70px !important;
        left:-35px !important;
    }
</style>