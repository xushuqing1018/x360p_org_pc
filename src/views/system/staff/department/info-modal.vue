<template>
	<Modal v-drag-modal :mask-closable="false" width="480" v-model="modal$.show" :title="modal$.title" @on-cancel="cancel">
		<template v-if="modal$.show">
        	<Form ref="form" :model="info" :label-width="80">
                <Form-item prop="dpt_type" label="类型">
                	<template v-if="modal$.action=='edit'">
                		<template v-if="info.dpt_type==2">
                			<Icon type="location"></Icon>
                    		<span>分公司</span>
                		</template>
                		<template v-if="info.dpt_type==1">
                			<Icon type="ios-home"></Icon>
                            <span>校区</span>
                		</template>
                		<template v-if="info.dpt_type==0">
                			<Icon type="network"></Icon>
                            <span>部门</span>
                		</template>
						<template v-if="info.dpt_type==3">
                			<Icon type="ios-paper"></Icon>
                            <span>项目</span>
                		</template>
                	</template>
                    <RadioGroup v-model="info.dpt_type" v-else>
                    	<Radio :label="2" v-if="info.pid==0&&enable_company">
                    		<Icon type="location"></Icon>
                    		<span>分公司</span>
                    	</Radio>
                        <Radio :label="1" :disabled="has_parent_school">
                            <Icon type="ios-home"></Icon>
                            <span>校区</span>
                        </Radio>
                        <Radio :label="0">
                            <Icon type="network"></Icon>
                            <span>部门</span>
                        </Radio>
						<Radio :label="3" v-if="enable_project && showProjects">
            				<Icon type="ios-paper"></Icon>
            				<span>项目</span>
                    	</Radio>
                    </RadioGroup>
                </Form-item>
                <Form-item prop="pid" label="上级部门">
            		<span v-if="modal$.action=='add'">{{parent_dept}}</span>
            		<select-department 
	            		v-model="info.pid" 
	            		rootAvailable 
	            		style="width:300px"
	            		v-if="modal$.action=='edit'">
            		</select-department>
                </Form-item>
                <Form-item prop="dpt_name" label="部门名称">
                    <Input type="text" v-model="info.dpt_name" style="width:300px"></Input>
                </Form-item>
				
				<Form-item prop="pj_id" label="所属项目" v-if="info.dpt_type==3">
					<Select style="width:200px" placeholder="项目" v-model="info.pj_id">
						<Option v-for="item in projects" :value="item.pj_id">
							{{item.pj_name}}
						</Option>
					</Select>
                </Form-item>
            </Form>
        </template>
    	<div slot="footer">
            <Button type="ghost" @click="cancel">取消</Button>
            <Button type="primary" :loading="saving" @click="save_dept">确定</Button>
        </div>
    </Modal>
</template>
<script>
	const INFO_NAME = '部门'
	const INFO_PK_ID = 'dpt_id'
	const INFO_URL   = 'departments'

	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	import SelectDepartment from 'c%/SelectDepartment.vue'

	export default {
		mixins: [common,modal,globals],
		components: {SelectDepartment},
		data () {
			return {
				info: {
					dpt_id:0,
					dpt_name:'',
					dpt_type:0,
					pid:0,
					pj_id:0,
				},
				showProjects: false                    // 校区下才可以添加项目
			}
		},
		methods: {
			
			cancel() {
				this.$form('form').reset()
				this.close()
			},
			save_dept() {
				if(this.info.dpt_type == 3) {
					if(this.info.pj_id === 0) {
							this.$Message.error('请选择所属项目')
							return false
					}				
				} else {
					if(this.info.dpt_type === '') {
						this.$Message.error('部门类型不能为空')
						return false
					}
					if(this.info.dpt_name === '') {
						this.$Message.error('部门名称不能为空')
						return false
					}
				}
				this.save()
				.then(()=>{
					this.$store.dispatch('updateGlobalVar','branchs')				
				})
			},
			findParent(data,pid) {
				let parent = data.find(item => item.dpt_id == pid)
				if(parent) {
					if(parent.dpt_type == 1) {
						this.info.dpt_type = 0
						return true
					}else{
						return this.findParent(data,parent.pid)
					}
				}else{
					return false
				}
			}
		},
        computed: {
			
			info_url$(){
    			return INFO_URL
	        },
	        info_name$(){
	            return INFO_NAME
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
					},
	        parent_dept() {
	        	if(this.info.pid === 0) {
	        		return this.org_name
	        	}else{
	        		return this.$filter('dpt_name')(this.info.pid)
	        	}
	        },
	        has_parent_school() {
	        	let departments = util.copy(this.$store.state.gvars.departments)
	        	if(this.modal$.action == 'add') {
	        		let current_row = departments.find(item => item.dpt_id == this.info.pid)
	        		if(current_row) {
	        			if(current_row.dpt_type == 1) {
	        				this.info.dpt_type = 0
	        				return true
	        			}else{
	        				return this.findParent(departments,current_row.pid)
	        			}
	        		}
	        	}else{
	        		return true
	        	}
	        }
		}
	}
</script>