<style>
.background-mobile{
	width: 375px;
	height: 200px;
	background-size: 100% 100%;
	margin: 0 auto;
}
</style>
<template>
	<div>
		<Form :label-width="120" class="porfile-form">
			<Form-item label="个人头像" class="b-b-1 padder-v" style="text-align: center;">		
				<div class="avatar-container">
					<img class="img-circle thumb-lg avatar-img" :src="user.avatar?user.avatar:'http://s1.xiao360.com/common_img/avatar.jpg'">
					<div class="avatar-hover">
						<Icon type="ios-eye-outline" @click.native="picturePreview(user.avatar)"></Icon>
					</div>
				</div>
				<div class="text-center">
					<Button type="primary" @click="changeAvatar">更换头像</Button>
				</div>
				<avatar-upload ref="avatarUpload" @on-save-success="avatarChanged"></avatar-upload>
			</Form-item>	
			<Form-item label="个人背景" class="b-b-1 padder-v" v-if="user.employee">
				<div class="background-mobile" :style="{backgroundImage: 'url('+background+')'}"></div>
				<x-upload	
					style="text-align: center;"
            		class="mt-3"         
            		:max-size="1024000"
            		:show-upload-list="false"
            	 	:headers="upload_header_file"
            	 	:on-exceeded-size="uploadExceededSize"
            	 	:on-success="uploadSuccess">
            	 	<span class="btn btn-primary btn-upload-avatar">更换背景</span>
			    </x-upload>
			</Form-item>
			<Form-item label="个人介绍" class="b-b-1 padder-v" v-if="isTeacher">
				<p class="notwrap text-over-elips">{{getInnerHTML(user.employee.profile.introduce)||'暂未填写个人介绍'}}</p>
				<a class="link pull-right" @click="preview">预览</a>
				<a class="link pull-right mr-3" @click="editIntroduce">编辑</a>
			</Form-item>
			<Form-item label="登录账号" class="b-b-1 padder-v">
				<span>{{user.account}}</span>
			</Form-item>
			<Form-item label="登录密码" class="b-b-1 padder-v">
				<span>*********</span>
				<a class="link pull-right" @click="modal_pwd = true">修改密码</a>
				<p class="text-muted">修改密码请点击右侧"修改密码"链接</p>
			</Form-item>
			<Form-item class="b-b-1 padder-v" label="真实姓名">
				<span>{{user.name}}</span>
				<span class="ml-3">昵称：{{user.employee.nick_name||'-'}}</span>
				<a class="link pull-right" @click="modal_name = true">修改昵称</a>
				<p class="text-muted">修改姓名请点击右侧"修改昵称"链接</p>
			</Form-item>
			<Form-item label="个人签名" class="b-b-1 padder-v" v-if="user.employee">
				<span>{{user.employee.profile.sign||'这个人很懒，还没有写个人签名'}}</span>
				<a class="link pull-right" @click="modal_sign = true">修改</a>
				<p class="text-muted">修改个人签名请点击右侧"修改"链接</p>
			</Form-item>
			<Form-item class="b-b-1 padder-v" label="手机绑定">
				<template v-if="user.is_mobile_bind===1" >
					<span class="binding">已绑定手机号  {{user.mobile}}</span>
					<a class="link pull-right" @click="modal_bind = true;verifiction.type = 'mobile'">修改手机号</a>
				</template>
				<div v-else>
					<span class="no-binding">暂未绑定手机</span>
					<a class="link pull-right" @click="modal_bind = true;verifiction.type = 'mobile'">绑定手机</a>
					<p class="text-muted">绑定手机请点击右侧"绑定手机"链接</p>
				</div> 
			</Form-item>
			<Form-item class="b-b-1 padder-v" label="邮箱绑定">
				<span v-if="user.is_email_bind===1" class="binding">已绑定邮箱  {{user.email}}</span>
				<div v-else>
					<span class="no-binding">暂未绑定邮箱</span>
					<a class="link pull-right" @click="modal_bind = true;verifiction.type = 'email'">绑定邮箱</a>
					<p class="text-muted">绑定邮箱请点击右侧"绑定邮箱"链接</p>
				</div>
			</Form-item>
			<Form-item class="b-b-1 padder-v" label="微信绑定">
                <span slot="label"><i class="fa fa-weixin"></i>微信绑定</span>
				<div v-if="user.is_weixin_bind">
					<span class="binding">已绑定微信  {{user.mobile}}</span>
					<Button type="warning" class="pull-right" @click="unBind">
		            	<i class="fa fa-weixin"></i>
		            	解除绑定
		        	</Button>
				</div>
				<div v-else>
					<span class="no-binding">暂未绑定微信</span>
					 <Button type="primary" class="pull-right" @click="makeCode">
		            	<i class="fa fa-weixin"></i>
		            	绑定微信
		        	</Button> 
	        	</div>
			</Form-item>
		</Form>
		
		<Modal :mask-closable="false" width="400" v-model="modal_sign" title="修改个人签名">
			<Input v-model="newSign" type="textarea" :autosize="{minRows: 2,maxRows: 5}" 
			 	placeholder="请输入签名..."></Input>
		 	<div slot="footer">
				<Button type="text" @click="cancel_sign">取消</Button>
				<Button type="primary" @click="change_sign">确认</Button>
			</div>
		</Modal>
		<Modal :mask-closable="false" v-model="modal_bind" :title="bind_title" width="400" @on-cancel="reset_varif">
			<Input v-if="verifiction.type === 'mobile'" class="mb-3" v-model="user.mobile" placeholder="请输入手机号"></Input>
			<Input v-else class="mb-3" v-model="user.email" placeholder="请输入邮箱" style="260px"></Input>
			<Input class="mr-3" v-model="verifiction.captcha" placeholder="请输入验证码" style="width:160px"></Input>
			<Button :disabled="verifiction.disabled || verifiction.time > 0" @click="get_captcha">{{text}}</Button>
			<div slot="footer">
				<Button type="text" @click="reset_varif">取消</Button>
				<Button type="primary" @click="bind">确认</Button>
			</div>
		</Modal>
		<Modal v-model="modal_qrcode" :mask-closable="false" width="340" title="绑定微信">
			<div class="qrcode">
				<img v-if="qrcode" :src="qrcode" style="width:308px">
			</div>
			<div slot="footer" class="text-center">
				<span>{{bind_weixin_status}}</span>
			</div>
		</Modal>
		<Modal :mask-closable="false" v-model="modal_pwd" title="修改密码">
			<Form :label-width="80">
				<Form-item label="原密码">
					<Input type="password" v-model="user.oldpassword" placeholder="请输入原始密码..."></Input>
				</Form-item>
				<Form-item label="新密码">
					<Input type="password" v-model="user.newpassword" placeholder="请输入新密码..."></Input>
				</Form-item>
				<Form-item label="重复一遍">
					<Input type="password" v-model="user.newpassword1" placeholder="请再次输入新密码..."></Input>	
				</Form-item>
			</Form>  
			<div slot="footer">
				<Button type="text" @click="cancelModelPwd">取消</Button>
				<Button type="primary" :loading="saving" @click="changePwd">确定</Button>
			</div>
	    </Modal>
	    <Modal :mask-closable="false" v-model="modal_name" title="修改昵称" @on-cancel="user.newname = user.employee.nick_name;modal_name = false">   
			<Form :label-width="60">
				<Form-item label="姓名">
					<Input v-model="user.newname" placeholder="请输入昵称"></Input>
				</Form-item>				
			</Form>          
			<div slot="footer">
				<Button type="text" @click="user.newname = user.employee.nick_name;modal_name = false">取消</Button>
				<Button type="primary" :loading="saving" @click="changeName">确定</Button>
			</div>
	    </Modal>	
	    
	    <introduce-modal ref="introduce" @on-save="changeUserInfo"></introduce-modal>
	    <phone-modal ref="phone"></phone-modal>
	</div>
</template>

<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import {_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import AvatarUpload from 'c%/AvatarUpload.vue'
	import introduceModal from './profile/introduce-modal.vue'
	import phoneModal from './profile/phone-modal.vue'
	import XUpload from 'c%/xupload/index'
	
	const time_out = null
    export default {
    	mixins: [common],
    	components: {
    		XUpload,
    		phoneModal,
    		AvatarUpload,
    		introduceModal,
		},        
        data () {
            return {
            	wx_status: 0,
            	verifiction: {
            		time: 0,
            		type: 'mobile',
            		text: '获取验证码',
            		captcha: '',
					disabled: false
            	},
            	modal_qrcode: false,
            	modal_bind: false,
            	modal_sign: false,
            	qrcode: null,
            	qrcode_uri: '',
            	user: {            		
            		avatar: '',
            		account: '',
            		mobile: '',
            		email: '',
            		name: '',    
            		password: '',
            		is_email_bind: 0,
            		is_mobile_bind: 0,
					is_weixin_bind: 0,	
					newname: '',
	            	oldpassword: '',
	            	newpassword: '',
	            	newpassword1: '',
	            	employee:{
	            		nick_name: '',
	            		profile:{
		            		sign: '',
		            		introduce: '',
		            		background_img: ''
		            	}
	            	}	            	
            	},
            	newSign: '',
            	userRules: {
                    oldpassword: [
                        { required: true, message: '请输入原始密码', trigger: 'blur' }
                    ],
                    newpassword: [
                        { required: true, message: '请输入新密码', trigger: 'blur' },
                        { type: 'string', min: 6, message: '密码长度不够', trigger: 'blur' }
                    ],
                    newpassword1:[
                    	{required:true,message:'请输入验证码',trigger:'blur'},
                    	{ type: 'string', min: 6, message: '密码长度不够', trigger: 'blur' }
                    ]
                },
            	modal_pwd: false,
            	modal_name: false,
            }
        },
        mounted() {
        	this.initData()    
        },
        computed:{
            upload_header_file () {
            	 return {
                    'x-token':this.$store.state.user.token,
                    'x-file-key':'file'
                }
            },
			text () {
				 return this.verifiction.time > 0 ? this.verifiction.time + 's 后重新获取' : '获取验证码'
			},
			bind_title () {
				return this.verifiction.type === 'mobile' ? '绑定手机' : '绑定邮箱'
			},
			bind_weixin_status () {
				let map = {0: '请用微信扫描二维码', 1: '绑定成功', 2: '绑定失败'}
				return map[this.wx_status]
			},
			background () {
				let [profile,background] = [this.user.employee.profile,'/static/hadmin/img/p_big3.jpg'] 
				if(profile&&profile.background_img) {
					background = profile.background_img
				}
				return background
			},
			isTeacher () {
				let employee = this.$store.state.user.info.employee
				
				if(!_.isEmpty(employee)&&employee.rids&&employee.rids.length>0){
					return employee.rids.indexOf(1)>-1||employee.rids.indexOf(2)>-1
				}
				return false
			}
        },
        methods: {
        	getInnerHTML (html) {
        		html = typeof html=='string'?html:''        		
        		
				return html.replace(/<[^>]+>/g,"")
			},
        	preview () {
        		let info = {
        			avatar: this.user.avatar,
        			background_img: this.background,
        			introduce: this.user.employee.profile.introduce
        		}
        		
        		this.$r('phone')
        		.set('info',info)
        		.show('教师介绍','add')
        	},
        	editIntroduce () {
        		let user = util.copy(this.user)
        		
        		if(user.employee!=null){
        			user.employee.profile.introduce = typeof user.employee.profile.introduce=='string'?user.employee.profile.introduce:''        			
        		}
        		
        		this.$r('introduce')
        		.set('user',user)
        		.show('修改个人介绍','add')
        	},
        	changeAvatar () {
        		let post = {
        			uid: this.$store.state.user.info.uid,
	        		_name: '',
	        		mod: 'user_avatar',
	        		_b64file: ''
        		}
        		
        		this.$refs['avatarUpload']
        		.set('post',post)
        		.show('修改头像','add')
        	},
        	avatarChanged (data) {
        		this.user.avatar = data.file_url	
        		this.$store.commit('updateUserInfo',{user:this.user,action:'changeAvatar'})
        	},
        	cancel_sign () {
        		this.modal_sign = false
        		this.newSign = this.user.employee.profile.sign 
        	},
        	change_sign () {
        		this.modal_sign = false
        		this.changeUserInfo(this.user,'changeSign')
        	},
        	unBind () {
        		this.$http.post('users/'+this.user.uid+'/dounbind')
        		.then(response=>{
        			this.wx_status = 0
        			this.user.is_weixin_bind = 0
        			this.$store.commit('updateUserInfo',{user:this.user,action: 'unbind_wx'})
        		}).catch(response=>{
        			this.error(response.body.message)
        		})
        	},
        	get_wx_status () {     
        		this.$http.get('users/get_bind_status')
        		.then(response=>{
        			let status = parseInt(response.body.data.status)
        			        			
        			if(status === 1){
        				this.user.openid = ''
        				this.user.is_weixin_bind = 1
        				this.$store.commit('updateUserInfo',{user:this.user,action: 'bind_wx'})
        				this.modal_qrcode = false
        			}
        			if(status === -1){
        				this.$Message.error('请求超时')
        				this.modal_qrcode = false
        			}
        			if(status === 2){
        				this.$Message.error('绑定失败')
        				this.modal_qrcode = false
        			}
        			
        			this.wx_status = status
        		})   
        		if(this.modal_qrcode === false){
        			return
        		}
        		setTimeout(()=>{
    				this.get_wx_status()
    			},1000)        		
        	},
        	reset_varif () {
        		this.verifiction.time = 0
        		this.verifiction.disabled = false
        		this.verifiction.captcha = ''
        		this.modal_bind = false
        		if(this.time_out) window.clearTimeout(this.time_out)
        		if(this.timer_interval) window.clearInterval(this.timer_interval)
        	},
        	timer_interval () {        		
        		if(this.verifiction.time > 0){
        			this.verifiction.time--
        			window.setTimeout(this.timer_interval,1000)
        		}
        	},
        	time_counting () {
        		this.verifiction.time = 60
        		this.timer_interval()
        		this.verifiction.disabled = false
        	},
        	get_captcha () {
        		this.verifiction.disabled = true
        		let params = {
        			type: this.verifiction.type,
        			value: this.user[this.verifiction.type]        			
        		}
        		this.$http.post('send_code',params)
        		.then(response=>{
        			this.time_out = setTimeout(this.time_counting, 2000)	
        		}).catch(response=>{
        			this.$Message.error(response.body.message)
        		})
        		
        	},
        	bind () {
        		let params = {
        			type: this.verifiction.type,
        			value: this.user[this.verifiction.type],
        			code: this.verifiction.captcha
        		}
        		let action = 'bind_mobile'
        		if(this.verifiction.type === 'mobile'){
        			if(/^\s*$/.test(this.user.mobile)) {
        				this.$Message.error('请输入手机号!') 
        				return false
        			}
        			if(!/^\d{8,11}$/.test(this.user.mobile)){
        				this.$Message.error('手机号格式错误!')
        				return false
        			} 
        		}        		
        		if(this.verifiction.type === 'email'){
        			action = 'bind_email'
        			if(/^\s*$/.test(this.user.email)){
        				this.$Message.error('请输入邮箱!')
        				return false
        			} 
        			if(!/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(this.user.email)){
        				this.$Message.error('邮箱格式错误!')
        				return false
        			} 
        		}
        		if(/^\s*$/.test(this.verifiction.captcha)){
        			this.$Message.error('请输入验证码!')
        			return false
        		}
        		else{
        			let uid = this.$store.state.user.info.uid
	        		this.$http.post('user/bind', params)
	        		.then(response=>{
	        			this.$Message.success('绑定成功!')
	        			this.$store.commit('updateUserInfo',{user:this.user,action:action})
	        			this.reset_varif()
	        			this.initData()
	        			this.modal_bind = false
	        		}).catch(response=>{
	        			this.error(response.body.message)
	        		})
        		}
        	},
            changePwd () {
            	if(/^\s*$/.test(this.user.oldpassword)){
                    this.$Message.error('请输入原密码!')
                    return false;
                }
            	if(/^\s*$/.test(this.user.newpassword)){
                    this.$Message.error('请输入新密码!')
                    return false;
                }
            	if(/^\s*$/.test(this.user.newpassword1)){
                    this.$Message.error('请再次输入新密码!')
                    return false;
                }
            	if(this.user.newpassword1 != this.user.newpassword){
            		this.$Message.error('两次密码不一致!请重新输入!')
            		return false;
            	}
            	
            	this.user.password=this.user.newpassword            	
            	
            	this.changeUserInfo(this.user,'changePwd')
            },
            cancelModelPwd () {            	
            	this.user.oldpassword = ''
            	this.user.newpassword = ''
            	this.user.newpassword1 = ''
            	this.modal_pwd = false
            },
            changeName () {
            	if(/^\s*$/.test(this.user.newname)){
                    this.$Message.error('请输入姓名!')
                    return false
                }
            	this.user.employee.nick_name = this.user.newname
            	
            	this.changeUserInfo(this.user,'changeName')
            },
            uploadSuccess (response, file, fileList) {
				this.user.employee.profile.background_img = response.data.file_url
				this.changeUserInfo(this.user,'changeBackgroundImg')
			},
			uploadExceededSize (file,fileList) {
				this.$Message.error('文件大小超出2M，请选择2M以内的图片')
			},
            initData () {
            	if(this.$store.state.user.info){
                    let info = util.copy(this.$store.state.user.info)
					this.user = info
            		this.user.password = ''
            		this.user.is_weixin_bind = info.is_weixin_bind
            		
            		if(!info.employee||!info.employee.profile){
            			this.user.employee = {
            				profile: {
	            				sign: '',
	            				introduce: '',
			            		background_img: ''
		            		}
            			}
            		}
            		
            		if(_.isEmpty(this.user.employee.profile.sign)){
            			this.user.employee.profile.sign = ''
            		}
            		if(_.isEmpty(this.user.employee.profile.introduce)){
            			this.user.employee.profile.introduce = ''
            		}
            		
            		this.newSign = this.user.employee.profile.sign
            	}
            },
            clearUser(){
                this.user.oldpassword = ''
                this.user.newpassword = ''
                this.user.newpassword1 = ''
                
                //保存成功后关闭Modal 取消按钮disable属性
                this.modal_pwd = false
        		this.modal_name = false
            },
            changeUserInfo (user,action,callback) {
                let update = { action: action }                
                
                switch(action){
                	case 'changePwd':
                		update.newpassword = user.newpassword
                    	update.oldpassword = user.oldpassword
                		break;
                	case 'changeName': 
                		update.nick_name = user.employee.nick_name
                		break;
                	case 'changeAvatar':
                		update.avatar = user.avatar
                		break;
                	case 'changeSign':
                		update.sign = this.newSign
                		user.employee.profile.sign = this.newSign
                		break;
                	case 'changeIntroduce':
                		this.user.employee.profile.introduce = util.copy(user.employee.profile.introduce)
                		update.introduce = user.employee.profile.introduce
                		break;
                	case 'changeBackgroundImg':
                		update.background_img = user.employee.profile.background_img
                		break;
                	default: 
                		break;
                }     
                
            	//显示loading
            	this.$http.put('profile',update)
            	.then(response=>{
            		this.$Message.success('保存成功！')
            		this.$store.commit('updateUserInfo',{user:user,action:action})
                    this.clearUser()
            	},response=>{
            		this.error(response.body.message)
            	})
            },
            makeCode () {
				this.$rest('users/'+this.user.uid+'/wechat_qrcode')
				.get()
				.success(data=>{					
					this.qrcode = data.url
					this.modal_qrcode = true
					this.get_wx_status()
				}).error(response=>{
					this.$Notice.error({
						title: '绑定失败',
						desc: response.body.desc||'绑定失败'
					})
				})
				
//				setTimeout(()=>{
//  				this.get_wx_status()
//  			},1000) 
            }
        }
    }
</script>

<style lang="less">
.porfile-form {
    .btn-upload-avatar{
        display: block !important;
        width: 88px;
        background-color: #2d8cf0;
        border-radius: 3px;
        margin: 10px auto;      
        cursor: pointer;
    }
    .avatar-container{
        display: inline-block;
        width: 96px;
        height: 96px;
        text-align: center;
        line-height: 96px;
        border: none;
        border-radius: 50%;
        overflow: hidden;
        background: #fff;
        position: relative;
    }
    .avatar-container:hover .avatar-hover{
        display: block;
    }
    .avatar-hover{
        display: none;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        border-radius: 50%;
        background: rgba(0,0,0,.6);
    }
    .avatar-hover i{
        color: #fff;
        font-size: 35px;
        cursor: pointer;
        line-height: inherit;
    }

    .text-muted {
        color: #98a6ad;
    }
    a.link{
        color:#4d90fe !important;
    }
    a.link:hover{
        text-decoration: underline !important;
    }
    .pull-right{
        float: right;
    }
    .thumb-lg{
        width: 96px;
        display: inline-block;
    }
    .img-circle{
        border-radius: 50%;
    }
    .ivu-form-item-label{
        font-weight: bold;  
    }
    .ivu-form-item-content span,.ivu-form-item-label,p.text-muted{
        font-size: 14px !important;
    }
    .binding{
        color:#35aa47;
    }
    .no-binding{
        color:#ed3f14;
    }
    .padder-v {
        padding: 15px 15px 15px 0;
    }
}
</style>
