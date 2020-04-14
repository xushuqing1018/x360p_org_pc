<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :width="1000" :mask-closable="false">
		<Form :label-width="100" label-position="right" ref="form" v-if="modal$.show">			
			<div>	
                <Row>
	            	<Col span="24">
	            		<table class="modal-table">
	            			<thead>
	            				<tr>
	            					<th width="100"><div class="ivu-table-cell">步骤</div></th>
	            					<th width="200"><div class="ivu-table-cell">步骤名称</div></th>
									<th><div class="ivu-table-cell">审批限制</div></th>
									<th width="300"></th>
	            					<th width="100"><div class="ivu-table-cell">允许自由选择</div></th>
									<th width="80px"><div class="ivu-table-cell">操作</div></th>
	            				</tr>
	            			</thead>
	            			<tbody>
	            				<tr v-for="(item,index) in info" :key="index">
	            					<td align="center"><div class="ivu-table-cell"><Input v-model="item.step" placeholder="请输入步骤"></Input></div></td>
	            					<td><div class="ivu-table-cell"><Input v-model="item.step_name" placeholder="请输入步骤名称"></Input></div></td>
									<td>
										<Select v-model="item.limit_type">
											<Option value="0">无限制</Option>
											<Option value="1">按角色</Option>
											<Option value="2">按部门</Option>
											<Option value="10">指定员工</Option>
										</Select>
									</td>
									<td style="max-width:200px;">
										<div class="ivu-table-cell">
											<Select v-model="item.limit_rids" multiple placeholder="请选择角色" v-if="item.limit_type=='1'">
												<Option :value="item.rid" v-for="(item,index) in roles" :key="index">{{item.role_name}}</Option>
											</Select>
											<select-department v-model="item.limit_dpt_ids" clearable placeholder="请选择部门" v-if="item.limit_type=='2'"></select-department>
											<select-employee v-model="item.limit_eids" clearable placeholder="请选择员工" v-if="item.limit_type=='10'"></select-employee>
										</div>
									</td>
	            					<td>
                                        <div class="ivu-table-cell">
                                            <i-switch v-model="item.allow_free">
					    	                    <Icon type="android-done" slot="open" :value="true"></Icon>
					    	                    <Icon type="android-close" slot="close" :value="false"></Icon>
					    	                </i-switch>
                                        </div>
                                    </td>
									<td>
	                    				<div class="ivu-table-cell">
											<Button type="text" icon="ios-trash" @click="delete_flow_type_step(item,index)"></Button>
	                    				</div>
	                    			</td>
	            				</tr>
	            				<tr>
	            					<td colspan="9" class="text-center"><i class="ivu-icon ivu-icon-plus" style="cursor: pointer;" @click="add_flow_type_step">&nbsp;添加步骤</i></td>
	            				</tr>
	            			</tbody>
	            		</table>
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
	
    import SelectEmployee from 'c%/SelectEmployee.vue'
    import SelectDepartment from 'c%/SelectDepartment.vue'
	
	export default{
		mixins: [ modal, common,globals ],
		components: {
            SelectEmployee,
            SelectDepartment
		},
		props: {
			ft_id: {
            	type: Number,
            	default: 0
            }
		},
		data () {
			return {
				info: []
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			init_data(){
				this.$rest('flow_type_steps?ft_id=' + this.ft_id+'&order_field=step&order_sort=asc').get()
				.success(data=>{
					data.list.forEach(data=>{
						data.limit_type = data.limit_type + ''
						data.allow_free = data.allow_free == 1
					})
					this.info = data.list
				})
			},
			ok () {
				try {
					this.info.forEach(data=>{
						if(/^\s*$/.test(data.step)){
                    	    throw new Error("步骤不能为空");
						}

                    	if(/^\s*$/.test(data.step_name)){
                    	    throw new Error("步骤名称不能为空");
						}

						if(data.limit_type == 1 && data.limit_rids.length == 0){
                		    throw new Error("请选择角色");
                		}

                		if(data.limit_type == 2 && data.limit_dpt_ids.length == 0){
                		    throw new Error("请选择部门");
                		}

                		if(data.limit_type == 10 && data.limit_eids == 0){
                		    throw new Error("请选择员工");
						}
						data.allow_free = data.allow_free ? 1 : 0
                	})
				} catch (e) {
					this.$Message.error(e.message)
					return
				}

				this.$http.post('flow_type_steps',this.info)
				.then(res => {
					this.$Message.success('设置成功');
					this.$emit('on-success')
					this.close()
				},res => {
					this.error(res.body.message);
				})
            },
            add_flow_type_step (){
                let flow_type_step_no = this.info.length + 1
                let flow_type_step = {
					ft_id:this.ft_id,
					fts_id:0,
					limit_dpt_ids:[],
					limit_eids:[],
					limit_rids:[],
					limit_type:'0',
					step: flow_type_step_no,
					step_name: '',
					allow_free: false
				}
                this.info.push(flow_type_step)
            },
            delete_flow_type_step (item,index){
				if (item.fts_id == 0) {
					this.info.splice(index,1)
				}else{
					this.$Modal.confirm({
						content: `确认要删除【${item.step_name}】流程步骤吗？`,
						onOk: ()=> {
							this.$http.delete('flow_type_steps/' + item.fts_id)
							.then(res => {
								this.$Message.success('删除成功');
								this.$emit('on-success')
								this.close()
							},res => {
								this.error(res.body.message);
							})
						}
					})
				} 
            }
		}
		
	}
</script>

<style>
</style>