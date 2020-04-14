<template>
    <div class="page-fp">
    	<div class="nav">
    		<div class="mod-nav">
    			<h1>找回密码</h1>
    		</div>
    	</div>
    	<div class="content">
    		<div class="mod-forgot">
    			<div class="input-warp">
					<h1>用手机号重置密码</h1>
					<div class="form-item tel-form-item">
						<input 
							ref="ref_tel"
							type="text" 
							v-model="user.telphone" 
							name="tel" 
							class="input-item input-tel" 
							placeholder="请输入手机号" 
							@on-change="">
						</input>
						<Icon type="android-phone-portrait" size="20"></Icon>
					</div>
					<div class="form-item capt-form-item">
						<input 
							type="text" 
							v-model="user.captcha" 
							name="capt" 
							class="input-item input-capt" 
							placeholder="请输入验证码">
						</input>
						<Icon type="ios-email" size="20"></Icon>
						<button 
							class="send-capt" 
							:class="{'loading':send.loading}" 
							@click="sendCapt" 
							:disabled="send.loading">{{send.text}}
						</button>
					</div>
					<div class="form-item pass-form-item">
						<input 
							type="password" 
							v-model="user.password" 
							name="pw" 
							class="input-item" 
							placeholder="请输入新密码">
						</input>
						<Icon type="android-lock" size="20"></Icon>
					</div>
					<div class="form-item pass-form-item">
						<input 
							type="password" 
							v-model="user.repassword" 
							name="repw" 
							class="input-item input-pass" 
							placeholder="请确认新密码">
						</input>
						<Icon type="android-lock" size="20"></Icon>
					</div>
					<button 
						class="reset-pass" 
						:class="{'loading':re_loading}" 
						:disabled="re_loading" 
						@click="resetPw">{{btn_text}}
					</button>
					<router-link to="/login"><Icon type="arrow-return-left" class="pr-1" size="14"></Icon>返回登录</router-link>
    			</div>
    		</div>
    	</div>
    </div>
</template>
<script>
	import util from '@/libs/util'

	const emptyObj = {
		telphone: '',
		captcha: '',
		password: '',
		repassword: ''
	}

	export default {
		data() {
			return {
				user: util.copy(emptyObj),
				send: {
					text: '发送验证码',
					loading: false
				},
				re_loading: false,
				pw_trim: '',
				repw_trim: '',
				tId: null
			}
		},
		mounted() {
			this.$refs.ref_tel.focus()
		},
		methods: {
			sendCapt() {
				if(!this.checkTel()) {
					return false
				}
				this.getCapt()
			},
			getCapt() {
				let time = 59
				if(this.send.loading) {
					return false
				}
				this.send = {loading: true,text: '60秒后重新获取'}
				this.tId = setInterval(() => {
					if(time < 10) {
						time = '0' + time
					}
					this.send.text = time + '秒后重新获取'
					time --
					if(time < 0) {
						clearInterval(this.tId)
						this.send = {loading: false,text: '发送验证码'}
					}
				}, 1000)
				this.$rest('open/vcode')
				.post({mobile:this.user.telphone,type:'forget'})
				.success(response => {

				})
				.error(response => {
					this.$Notice.error({
	                    title: '获取验证码失败',
	                    desc: response.body.message
	                })
	                clearInterval(this.tId)
	                this.send = {loading: false,text: '发送验证码'}
				})
			},
			resetPw() {
				let capt = this.user.captcha
				if(!this.checkTel()) {
					return false
				}
				if(capt === '') {
					this.$Notice.error({
	                    title: '请输入验证码',
	                    desc: '验证码不能为空'
	                })
					return false
				}
				if(!this.checkPw()) {
					return false
				}
				this.resetSubmit()
			},
			resetSubmit() {
				this.re_loading = true
				this.$rest('open/reset_pwd')
				.post({
					mobile: this.user.telphone,
					code: this.user.captcha,
					password: this.pw_trim,
					repassword: this.repw_trim
				})
				.success(reponse => {
					this.$Modal.success({
                        title: '提示',
                        content: '<p>密码重置成功，点击确定返回登录界面</p>',
                        onOk: () => {
                        	this.$router.push('/login')
                        }
                    })
	                this.resetData()
				})
				.error(response => {
					this.$Notice.error({
	                    title: '重置密码失败',
	                    desc: response.body.message
	                })
	                this.re_loading = false
				})
			},
			checkTel() {
				let tel = this.user.telphone
				if(tel === '') {
					this.$Notice.error({
	                    title: '请先输入手机号',
	                    desc: '手机号不能为空'
	                })
					return false
				}
				if(tel !== '' && !(/^\d{8,11}$/).test(tel)) {
					this.$Notice.error({
	                    title: '请重新输入手机号',
	                    desc: '手机号格式不正确'
	                })
					return false
				}
				return true
			},
			checkPw() {
				let pw = this.user.password,
					repw = this.user.repassword
				this.pw_trim = pw.replace(/(^\s*)|(\s*$)/g, '')
				this.repw_trim = repw.replace(/(^\s*)|(\s*$)/g, '')
				if(this.pw_trim === '') {
					this.$Notice.error({
	                    title: '请输入新密码',
	                    desc: '新密码不能为空'
	                })
					return false
				}else{
					if(!/[x00-xff]+/g.test(this.pw_trim)) {
						this.$Notice.error({
		                    title: '请重新输入新密码',
		                    desc: '密码支持数字、字母、所有标点符号'
		                })
		                return false
					}
					if((/\s+/g).test(this.pw_trim)) {
						this.$Notice.error({
		                    title: '请重新输入新密码',
		                    desc: '密码中不能包含空格'
		                })
		                return false
					}
					if(this.pw_trim.length < 6) {
						this.$Notice.error({
		                    title: '请重新输入新密码',
		                    desc: '密码不能小于6位'
		                })
		                return false
					}
				}
				if(this.repw_trim === '') {
					this.$Notice.error({
	                    title: '请输入确认密码',
	                    desc: '确认密码不能为空'
	                })
					return false
				}else{
					if(this.pw_trim !== this.repw_trim) {
						this.$Notice.error({
		                    title: '请重新输入确认密码',
		                    desc: '输入的密码与确认密码不一致'
		                })
						return false
					}
				}
				return true
			},
			resetData() {
				clearInterval(this.tId)
				this.user = util.copy(emptyObj)
				this.send = {loading: false,text: '发送验证码'}
				this.pw_trim = ''
				this.repw_trim = ''
				this.re_loading = false
			}
		},
		computed: {
			btn_text() {
				return this.re_loading ? '重置中' : '重置密码'
			}
		}
	}
</script>
<style lang="less">
	.page-fp {
		.head {
			width: 980px;
			margin: 0 auto;
			height: 75px;
			line-height: 75px;
		}
		.tel {
			padding-left: 5px;
			font-size: 14px;
			vertical-align: middle;
		}
		.nav {
			height: 46px;
			background: #fafafa;
			width: 100%;
			box-shadow: 0 1px 1px #eee;
			.mod-nav {
				width: 980px;
				margin: 0 auto;
				h1 {
					color: #333;
					font-size: 14px;
					font-weight: 700;
					line-height: 46px;
					margin-left: 70px;
				}
			}
		}
		.content {
			width: 980px;
			margin: 0 auto;
			.mod-forgot {
				display: flex;
				align-items: center;
				justify-content: center;
				min-height: 600px;
				height: auto;
				width: 980px;
				.input-warp {
					width: 400px;
					height: 450px;
					text-align: center;
					box-shadow: 5px 5px 8px #eee;
					border: 1px solid #ddd;
					padding: 30px 20px 20px;
					h1 {
						color: #333;
						font-size: 16px;
						font-weight: 500;
						margin-bottom: 40px;
					}
					.form-item {
						display: inline-block;
						width: 270px;
					}
					.tel-form-item,
					.capt-form-item,
					.pass-form-item {
						position: relative;
					}
					.send-capt {
						position: absolute;
						top: 9px;
						right: 8px;
						padding: 2px 8px;
						border-radius: 12px;
						font-size: 8px;
					}
					.loading {
						cursor: not-allowed;
						opacity: 0.5;
					}
					.reset-pass {
						display: block;
						margin: 40px auto;
						width: 270px;
					    border-radius: 20px;
					    padding: 7px 0;
					    font-size: 16px;
					}
					button {
						color: #fff;
						background: #41b1e2;
						border: none;
					    outline: none;
						cursor: pointer;
						&:hover {
					      background-color: #169bd5;
					    }
					}
					.input-item {
						width: 100%;
						padding: 12px 10px 12px 38px;
						height: 38px;
						border: 1px solid #afabab;
						margin-bottom: -1px;
						font-size: 14px;
					    color: #666;
					    transition: .3s;
					    outline: none;
					}
					.ivu-icon-android-phone-portrait {
						position: absolute;
						top: 10px;
    					left: 9px;
					}
					.ivu-icon-ios-email,
					.ivu-icon-android-lock {
						position: absolute;
						top: 10px;
    					left: 8px;
					}
				}
			}
		}
	}
</style>