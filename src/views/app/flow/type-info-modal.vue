<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :width="800" :mask-closable="false">
		<Form :label-width="100" label-position="right" ref="form" :model="info" v-if="modal$.show">		
			<div>			
                <Row>
                    <Col>
                        <Form-item label="流程类型名称" prop="ft_name">
                        	<Input v-model="info.ft_name" placeholder="请输入流程类型名称"></Input>
				        </Form-item>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form-item label="流程描述" prop="ft_desc">
                            <Input type="textarea" v-model="info.ft_desc" :autosize="{minRows:2,maxRows:5}" placeholder="请输入流程描述"></Input>
                        </Form-item>
                    </Col>
                </Row>
				<Row>
					<Col span="13">
						<Form-item label="发起限制" prop="limit_type">
							<RadioGroup v-model="info.limit_type" type="button">
                                <Radio label="0">
                                    <span>无限制</span>
                                </Radio>
                                <Radio label="1">
                                    <span>按角色</span>
                                </Radio>
                                <Radio label="2">
                                    <span>按部门</span>
                                </Radio>
                                <Radio label="10">
                                    <span>指定员工</span>
                                </Radio>
							</RadioGroup>
						</Form-item>
					</Col>
					<Col span="11">
						<Form-item label="选择角色" prop="limit_rids" v-if="info.limit_type=='1'">
                            <Select v-model="info.limit_rids" multiple placeholder="请选择角色">
				            	<Option :value="item.rid" v-for="(item,index) in roles" :key="index">{{item.role_name}}</Option>
				            </Select>
						</Form-item>
                        <Form-item label="选择部门" prop="limit_dpt_ids" v-if="info.limit_type=='2'">
							<select-department v-model="info.limit_dpt_ids" clearable placeholder="请选择部门"></select-department>
						</Form-item>
                        <Form-item label="选择员工" prop="limit_eids" v-if="info.limit_type=='10'">
							<select-employee v-model="info.limit_eids" clearable placeholder="请选择员工"></select-employee>
						</Form-item>
					</Col>
				</Row>	
				<Row>
					<Col>
						<Form-item label="流程步骤类型">
							<RadioGroup v-model="info.flow_step_type" type="button">
                                <Radio label="0">
                                    <span>自由流程</span>
                                </Radio>
                                <Radio label="1">
                                    <span>固定流程</span>
                                </Radio>
							</RadioGroup>
						</Form-item>
					</Col>
				</Row>
				<!--
                <Row>
                    <Col>
                        <Form-item label="是否系统流程">
					    	<i-switch :true-value="1" :false-value="0" v-model="info.is_system">
					    	    <Icon type="android-done" slot="open" :value="true"></Icon>
					    	    <Icon type="android-close" slot="close" :value="false"></Icon>
					    	</i-switch>
					    </Form-item>
                    </Col>
                </Row>
				-->
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
	
    import SelectEmployee from 'c%/SelectEmployee.vue'
    import SelectDepartment from 'c%/SelectDepartment.vue'
	
	export default{
		mixins: [ modal, common,globals ],
		components: {
            SelectEmployee,
            SelectDepartment
		},
		data () {
			return {
				info: {
    				    ft_id: 0,
    				    ft_name: '',
    				    ft_desc: '',
    				    limit_eids: [],
    				    limit_dpt_ids: [],
    				    limit_rids: [],
    				    limit_type: '0',
    				    is_system: 0,
						flow_step_type: '0',
						og_id: this.og_id$
					}
			}
        },
		methods: {
			ok () {
				if(/^\s*$/.test(this.info.ft_name)){
					this.$Message.error('请输入流程类型名称')
					return
                }

                if(this.info.limit_type == 1 && this.info.limit_rids.length == 0){
                    this.$Message.error('请选择角色')
					return
                }

                if(this.info.limit_type == 2 && this.info.limit_dpt_ids.length == 0){
                    this.$Message.error('请选择部门')
					return
                }

                if(this.info.limit_type == 10 && this.info.limit_eids.length == 0){
                    this.$Message.error('请选择员工')
					return
                }
				
				let [uri,method,msg] = this.modal$.action=='add'?['flow_types','post','添加成功']:['flow_types/'+this.info.ft_id,'put','修改成功']
				
				this.$rest(uri)[method](this.info)
				.success(data=>{
					this.$Message.success(msg)
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'添加失败~')
				})
            }
		}
		
	}
</script>

<style>
</style>