<template>
	<Modal :mask-closable="false" @on-cancel="cancel" v-model="modal$.show" :title="modal$.title" width="800"> 
    	<Tabs v-model="tabs">
    		<TabPane name="basic" label="基础信息">
    			<Form ref="form" :label-width="80" :model="info.employee" :rules="rules_employee" v-show="tabs=='basic'">
        			<Row class="mb-3">
	                    <Col span="8">
	                        <Form-item label="姓名" prop="ename">
	                            <Input type="text" v-model="info.employee.ename" placeholder="请输入姓名"></Input>
	                        </Form-item>
	                    </Col>
	                    <Col span="6">
	                        <Form-item label="性别">
	                        	<Radio-group v-model="info.employee.sex">
	        		                <Radio label="1">男</Radio>
	        		                <Radio label="2">女</Radio>
	        		            </Radio-group>		          
	        		        </Form-item>
	                    </Col>
	                    <Col span="10">
                    	    <Form-item label="出生日期">
			                	<Date-picker type="date" v-model="info.employee.birth_time" placeholder="选择日期" style="width:100%"></Date-picker>
			                </Form-item>
	                    </Col>
	                </Row>
	                <Row class="mb-3">
	                	<Col span="24">
		                	 <Form-item label="所在校区" prop="bids">
			                    <select-branch v-model="info.employee.bids" clearable></select-branch>
			                </Form-item>
						</Col>
	                </Row>
	                <Row class="mb-3">
	                    <Col span="24">
	                        <Form-item label="科目" prop="sj_ids">
	                            <select-subject v-model="info.employee.sj_ids" :clearable="true" />
	                        </Form-item>
	                    </Col>
	                </Row>
	                <Row class="mb-3">
	                    <Col span="12">
	                        <Form-item label="手机号" prop="mobile">
	                            <Input type="text" v-model="info.employee.mobile" placeholder="请输入手机号"></Input>
	                        </Form-item>
	                    </Col>
	                    <Col span="12">
	                        <Form-item label="Email" prop="email">
	                            <Input type="text" v-model="info.employee.email" placeholder="请输入Email地址"></Input>
	                        </Form-item> 
	                    </Col>
	                </Row>	               
                </Form>
    		</TabPane>
    		<TabPane name="introduce" label="个人介绍">            			
            	<umeditor v-model="info.employee.profile.introduce" v-show="tabs=='introduce'"></umeditor>
    		</TabPane>
    		<TabPane name="account" label="开启账号">
    			<Form ref="form_account" clearable="true" :model="info.user" :rules="rules_account" :label-width="80" v-if="tabs=='account'">
	                <div v-if="modal$.action === 'add'">  
		                <Form-item label="开启账号">
		                	<i-switch v-model="info.open_account">
						        <Icon type="android-done" slot="open"></Icon>
						        <Icon type="android-close" slot="close"></Icon>
						    </i-switch>
		                </Form-item>
		                <div v-if="info.open_account">
	                        <Row>
	                            <Col span="12">
	        	                	<Form-item label="账号" prop="account">
	        		                    <Input type="text" value="" autocomplete="off" v-model="info.user.account" placeholder="请输入账号"></Input>
	        		                </Form-item>
	                            </Col>
	                            <Col span="12">
	                                <Form-item label="密码" prop="password">
	                                    <Input type="text" value="" autocomplete="off" v-model="info.user.password" placeholder="请输入密码"></Input>
	                                </Form-item>
	                            </Col>
	                        </Row>
	                        <Row>
	                            <Col span="12">
	                                <div class="ivu-form-item">
	                                    <label class="ivu-form-item-label" style="width:80px;">
	                                    </label>
	                                    <div class="ivu-form-item-content">
	                                        <a @click="account_input('pinyin')">拼音</a>
	                                        <a @click="account_input('mobile')">手机号</a>
	                                        <a @click="account_input('email')">Email</a>
	                                    </div>
	                                </div>
	                            </Col>
	                            <Col span="12">
	                                <div class="ivu-form-item">
	                                    <label class="ivu-form-item-label" style="width:80px;">
	                                    </label>
	                                    <div class="ivu-form-item-content">
	                                        <a @click="info.user.password = random(6)">随机</a>
	                                        <a @click="info.user.password='123456'">123456</a>
	                                        <a @click="info.user.password='888888'">6个8</a>
	                                    </div>
	                                </div>
	                                
	                            </Col>
	                        </Row>          	  
		                </div>
	                </div>
	            </Form>  
    		</TabPane>
    	</Tabs>            
        <div slot="footer">
            <Button type="ghost" @click="cancel">取消</Button>
            <Button type="primary" v-if="modal$.action==='add'" :loading="saving" @click="save()">确定</Button>                
            <Button type="primary" v-else :loading="saving" @click="save()">确定</Button>
        </div>
    </Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import pinyin from '@/libs/pinyin'
	
	import Umeditor from 'c%/UmEditor'
	import SelectBranch from 'c%/SelectBranch.vue'
    import SelectSubject from 'c%/SelectSubject.vue'
    
	const emptyObject = {
		open_account: false,
        employee: {
            eid: 0,
            ename: '',
            bids: [],
            sj_ids: [],
            rids: [1],
            sex: '1',
            mobile:'',
            email:'',
            birth_time: null,
            profile:{
                introduce: ''   
            }                        
        },
        user: {
            account: '',
            password: ''                    
        }
	}
	
	export default{
		mixins: [modal,common],
		components: {
			Umeditor,
        	SelectBranch,
            SelectSubject
		},
		data () {
			return {
				tabs: 'basic',
				info: util.copy(emptyObject),
				rules_employee: {
					ename: [
                		{ required: true, message: '请输入用户姓名!', trigger: 'blur' }
                	],
                	rids: [
                		{ required: true, type: 'array', message: '请选择用户角色!', trigger: 'change' },
                	],
                	bids: [
                		{ required: true, type: 'array', message: '请选择用户校区!', trigger: 'change' },
                	],
                    mobile:[
                    	{ required: true, message: '手机号不能为空!', trigger: 'blur' },
                        { pattern: /^\d{8,11}$/, message: '手机格式错误', trigger: 'blur'}
                    ],
                    email:[
                    	{ required: true, message: '邮箱不能为空!', trigger: 'blur' },
                        { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
                    ]
				},
				rules_account: {
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
		methods: {
			account_input(type){
                let account = ''
                if(type == 'pinyin'){
                    account = pinyin.getFirstFull(this.info.employee.ename)
                }else{
                    account =  this.info.employee[type]
                }

                this.info.user.account = account
            },
			random(length){
                return util.random(length)
            },
			cancel () {
				this.$form('form').reset()
				this.info = util.copy(emptyObject)
				this.close()
			},
			save () {
				let action = this.modal$.action,
					[method,msg,uri] = action=='add'?['post','添加成功','employees']:['put','编辑成功','employees/' + this.info.employee.eid]
				
				this.$form('form').check().then(()=>{
            		this.$rest(uri)[method](this.info)
            		.success(data=>{
            			this.$Message.success(msg)
            			this.$emit('on-success')
            			this.cancel()
            		}).error(body=>{
            			this.$Notice.error({
            				title: '失败',
            				desc: body.message||'操作失败'
            			})
            		})
            		
            	})
			}
		}
	}
</script>
