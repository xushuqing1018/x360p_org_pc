<template>
<Modal :mask-closable="false" title="开启账号" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
	<Form ref="form" clearable="true" :label-width="80" :model="info" :rules="rules">
		<Form-item label="账号" prop="account">
            <Input type="text" value="" autocomplete="off" v-model="info.account" placeholder="请输入账号"></Input>
        </Form-item>
        <Form-item label="密码" prop="password">
            <Input type="text" value="" autocomplete="off" v-model="info.password" placeholder="请输入密码"></Input>
        </Form-item>
	</Form>
	<div slot="footer">
        <Button type="ghost" @click="close">取消</Button>                                
        <Button type="primary" :loading="saving" @click="save">确定</Button>                
    </div>
</Modal>	
</template>
<script>
	import {_} from '@/libs/util' 
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	const INFO_NAME_1 = '员工账号'
	const INFO_NAME_2 = '加盟商账号'
	const INFO_PK_ID = 'uid'
	const INFO_URL   = 'employees/%s/doactive'

	const emptyObject = {
            account: '',
            password: ''
	}
	
	export default{
		name:'employeeAccountModal',
		mixins:[modal,common],
		props:{
			employee:{
				type:Object,
				default(){
					return {
						uid:0
					}
				}
			},
			mode: {
				type:String,
				default:'employee'
			}
		},
		data () {
			return {
				info: util.copy(emptyObject),
				rules: {
            	    account: [
            	    	{ required: true, message: '请输入用户账号!', trigger: 'change' }
            	    ],
            	    password:[
            	    	{ required: true, message: '请输入用户密码!', trigger: 'change' },
            	    	{ type: 'string', min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
        	    	]
                }
			}
		},
		watch: {
			'modal$.action':{
	            handler:function(action){
	            	if(action == 'add'){
						this.info = util.copy(emptyObject)
					}
	            }
	        }
        },
		methods: {
			save(){
	            this.$form('form').check().then(form=>{
	                if(this.info.bid == 0){
	                    this.info.bid = this.$store.state.branch.id
	                }
	                let method = this.modal$.action == 'add'?'post':'put'
	                let action = this.modal$.action == 'add'?'添加':'修改'
	                let $rest  = this.modal$.action == 'add'?this.$rest(this.info_url$):this.$rest('users')
	                if(this.modal$.action != 'add'){
	                    $rest.add_url_param(this.employee.uid)
	                }
	                $rest[method](this.info)
	                .success(response=>{
	                    let data = response.data
	                    
	                    if(this.modal$.action == 'add' && _.isString(data) && /^\d+$/.test(data)){
	                        this.info[this.info_pk_id$] = util.int(data)
	                    }
	                    this.$Message.success(util.sprintf('%s%s成功!',this.info_name$,action))
	                    this.$emit('save',{action:this.modal$.action,data:this.info})
	                    if(_.isDefined(this.$store.state.gvars[this.info_url$])){
	                        this.$store.dispatch('updateGlobalVar',this.info_url$)
	                    }
	                    this.close()
	                })
	                .error(response=>{
	                    this.error(response.body.message)
	                })
	            })
	        }
		},
		computed: {
			info_url$(){
            	return util.sprintf(INFO_URL,this.employee.eid)
	        },
	        info_name$(){
	            return this.mode=='employee'?INFO_NAME_1:INFO_NAME_2
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
	        }

		}
	}
</script>