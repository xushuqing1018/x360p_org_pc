<template>
  <div class="box" :style="{backgroundImage: 'url('+ loginBg + ')'}">  	  	
    <div class="box-login" :style="{background: login_box_bg}" :class="{ 'box-login-style2': login_box_bg != '#fff'}">
    	<div :class="{ 'login-div-style2': login_box_bg != '#fff'}">
      <div class="login-contanier" :class="{ 'login-contanier-style2': login_box_bg != '#fff'}">
	      <p class="login-header" :class="{ 'login-header-style2': login_box_bg != '#fff'}">
          <img height="50px" :src="login_box_title_logo" style="position:relative;bottom:10px;"/> 
          <br v-if="login_box_title_logo != ''"/>
          {{title}}
        </p>
	      <div class="login-content" :style="{background: login_content}">
	        <div class="input-container user-container">
	        	<div class="input-box">
		          <span 
		          	class="input-placeholder" 
		          	:class="{
		          	['focus']:accountFocus,
		          	['fill']:formLogin.account
		          }">
	          		账号
		          </span>
		          <input type="text" 
		          			 class="box-input"
		                 v-model="formLogin.account"
		                 v-focusme="'account'"
		                 @focus="inputFocus($event,'account')"
		                 @blur="inputBlur($event,'account')" 
		                 @keyup.enter.prevent="focus('password')" />
		          <span class="host" v-if="subHost">{{suffix}}</span>
		          <Icon class="input-icon" type="ios-close-empty" v-if="formLogin.account!==''" @click.native="clearAccount"></Icon>
	          </div>
					</div>
					<div class="input-container password-container">
						<div class="input-box">
		          <span 
		          	class="input-placeholder"  
		          	:class="{
			          	['focus']:passwordFocus,
			          	['fill']:formLogin.password
			          }">
			         	 密码
		          </span>
		          <input type="password"
		          			 class="box-input"
		                 v-model="formLogin.password"
		                 v-focusme="'password'"
		                 @focus="inputFocus($event,'password')"
		                 @blur="inputBlur($event,'password')"
		                 @keyup.enter.prevent="focus('captcha')"/>
		          <Icon class="input-icon" type="ios-close-empty" v-if="formLogin.password!==''" @click.native="clearPw"></Icon>
	          </div>
	        </div>
	        <div class="input-container captcha-contanier">
	          <div class="input-box captcha-wrap">
	          	<!--<span 
		          	class="input-placeholder"  
		          	:class="{
			          	['focus']:captchaFocus,
			          	['fill']:formLogin.captcha
			          }">
			         	 验证码
		          </span>-->
	            <input type="text" 
	            			 class="box-input"
	                   v-model="formLogin.captcha"
	                   v-focusme="'captcha'"
	                   @focus="inputFocus($event,'captcha')"
	                   @blur="inputBlur($event,'captcha')"
	                   @keyup.enter.prevent="login"
	                   placeholder="计算结果"/>
	          </div>
	          <div class="img-wrap">
	            <img :src="captchaUrl" @click="refreshCaptcha"/>
	          </div>
	        </div>
	        
	        <button class="btn-login mb-2" @click="login" :disabled="loading" :style="{background: login_box_btn_color}">{{btnText}}</button>
	        <div class="forget_pw cursor text-info pull-right" @click="forgetPw">忘记密码?</div>
	        <footer class="footer">
			      <span v-html="copyright"></span>
            <p class="lang-switch" v-if="show_lang_btn">
              <a href="/">简体</a> | <a href="/tc">繁体</a> | <a href="/en">English</a>
            </p>
			    </footer>
	      </div>
    </div>  
    </div> 
    </div>    
  </div>
</template>

<script>
import {_} from '@/libs/util'
import $rest from '@/libs/rest' 
import Auth from '@/libs/auth'
import directive from '@/libs/directive.mixin'
import common from '@/libs/common.mixin'

export default {
  name: 'login',
  mixins: [directive,common],
  data () {
    return {
      loading:false,
      accountFocus: false,
      captchaFocus: false,
      passwordFocus: false,
      formLogin: {
        account: '',
        password: '',
        captcha: ''
      },
      captchaUrl:'/api/captcha',
      subHost: window.CLIENT_DOMAIN
    }
  },
  computed: {
    suffix() {
      return this.subHost?`@${this.subHost}`:''
    },
    btnText(){
      if(this.loading){
        return '登录中...'
      }
      return '登录'
    },
    loginBg () {
    	let [ui,result] = [window.CLIENT_PARAMS,'']    	
    	let img_list = ['http://sp1.xiao360.com/static/img/loginbg/1.png','http://sp1.xiao360.com/static/img/loginbg/2.png','http://sp1.xiao360.com/static/img/loginbg/3.png']
    	let index = Math.floor((Math.random()*img_list.length)); 
    	result = img_list[index]
    	
    	if(!_.isEmpty(ui) && !_.isEmpty(ui.pc.login_img)){
    		result = ui.pc.login_img
    	}
    	return result
    },
    title () {
			let [ui,result] = [window.CLIENT_PARAMS,'校360专业版']
    	if(!_.isEmpty(ui) && !_.isEmpty(ui.pc.system_name)){
    		result = ui.pc.system_name
    	}
    	return result
    },
    copyright () {
      let year   = (new Date()).getFullYear()
    	let result = 'Copyright&nbsp;&copy;&nbsp;2006-'+year+'&nbsp;<a href="http://www.lantel.net">浪腾软件</a>&nbsp;版权所有',
    			ui = window.CLIENT_PARAMS
    			
			if(!_.isEmpty(ui) && !_.isEmpty(ui.pc.copyright)){
	    		result = ui.pc.copyright
			}
			
			return result
    },
    login_box_bg (){
      let [ui,result] = [window.CLIENT_PARAMS,'#fff']
    	if(!_.isEmpty(ui) && ui.pc.login_box_style == 2 && !_.isEmpty(ui.pc.login_box_bg)){
    		result = 'url('+ ui.pc.login_box_bg + ') no-repeat center center'
    	}
    	return result
    },
    login_box_title_logo (){
      let [ui,result] = [window.CLIENT_PARAMS,'']
    	if(!_.isEmpty(ui) && ui.pc.login_box_style == 2 && ui.pc.login_box_title_style == 2 && !_.isEmpty(ui.pc.login_box_title_logo)){
    		result = ui.pc.login_box_title_logo
    	}
    	return result
    },
    login_box_btn_color (){
      let [ui,result] = [window.CLIENT_PARAMS,'']
    	if(!_.isEmpty(ui) && !_.isEmpty(ui.pc.login_box_btn_color)){
    		result = ui.pc.login_box_btn_color
    	}
    	return result
    },
    login_content (){
      let [ui,result] = [window.CLIENT_PARAMS,'#fff']
    	if(!_.isEmpty(ui) && ui.pc.login_box_style == 2 && !_.isEmpty(ui.pc.login_box_bg)){
    		result = 'none'
    	}
    	return result
    },
    show_lang_btn(){
      let [ui,result] = [window.CLIENT_PARAMS,0]
    	if(!_.isEmpty(ui) && _.isDefined(ui.pc.show_lang_btn)){
    		result = ui.pc.show_lang_btn
    	}
    	return result
    }
  },
  methods: {
    refreshCaptcha() {
      this.captchaUrl = '/api/captcha?t='+Math.random()
    },
    focus(name) {
      this.inputelem = name
    },
    forgetPw() {
      this.$router.push('/forgotpw')
    },
    login() {
      if(/^\s*$/.test(this.formLogin.account)) {
        this.$Message.error('请输入您的账号')
        this.focus('account')
        return false
      }
      if(/^\s*$/.test(this.formLogin.password)) {
        this.$Message.error('请输入您的密码')
        this.focus('password')
        return false
      }
      if(/^\s*$/.test(this.formLogin.captcha)){
          this.$Message.error('请输入验证码!')
          this.focus('captcha')
          return false;
      }
      this.doLogin(this.formLogin.account + this.suffix, this.formLogin.password, this.formLogin.captcha)
    },
    doLogin(account,password,captcha){
      if(this.loading) return
      this.loading = true
      this.$http.post('signin',
        {account:account,
        password:password,
        captcha:captcha}
        )
      .then(response=>{

        Auth.setLocalLogin(response.body.data)
        if(this.org_type==2) {
          this.$router.push({ path: '/support' })
        }else{
          this.$router.push({ path: '/' })
        }
        
        var is_warn = response.body.data.client.is_warn;
        var expire_message = response.body.data.client.expire_message;
        if(is_warn) {
          this.$store.commit('showGTip',expire_message);
        }
      },response=>{
            this.loading = false
            let msg = response.body.message
            let msg_map = {
              'captcha_error':'验证码错误',
              'password_is_wrong':'密码错误',
              'account_does_not_exists':'账号不存在',
              'user_is_disabled':'账号被禁用',
              'client_time_not_correct':'您的电脑系统日期不对,请先将电脑日期设置正确!'
            }
            msg = msg_map[msg]?msg_map[msg]:msg;
            if(response.body.message == 'captcha_error'){
                this.focus('captcha')
            }else if(response.body.message == 'password_is_wrong'){
                this.focus('password') 
            }else if(response.body.message == 'account_does_not_exists'){
                this.focus('account')
            }
            this.refreshCaptcha()
            this.$Message.error(msg)
      })
    },
    rest_days(expire_day) {
      let expire_time = Date.parse(this.$filter('int_date')(expire_day)),
        today_time  = Date.parse(new Date()),
        rest 		= expire_time - today_time
      if(rest > 0) {
        return Math.round(rest / 1000  /  60  /  60  / 24)
      }else{
        return 0
      }
    },
    inputFocus(event,type) {
      let style = event.target.parentNode.style
      style.borderColor = '#5cadff'
      style.color = '#5cadff'
      if(type){
      	let field = type+'Focus'
      	this[field] = true
      }
    },
    inputBlur(event,type) {
      let style= event.target.parentNode.style
      style.borderColor = '#DDDDDD'
      style.color = '#c5c5c5'
      if(type){
      	let field = type+'Focus'
      	this[field] = false
      }
    },
    clearPw() {
      this.formLogin.password = ''
      this.focus('password')
    },
    clearAccount() {
      this.formLogin.account = ''
      this.focus('account')
    }
  },
  mounted() {
    if(Auth.isLogin()) {
      this.$router.push({path:'/'})
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
  @import '../style/mixin.less';
  .login-content{
    background: #fff;
    border-radius: 4px;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    -webkit-transition: all .3s;
    transition: all .3s;
    padding: 34px 0 24px 0;
  }
  .box{    
    background: url(/static/img/BG-2.png) 50% 50%/cover no-repeat fixed;
    background-color: #fff;
    width: 100%;
    position: absolute;
    height: 100%;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
  }
  .box-login {
    width: 360px;
    background-color: #fff;
    border-radius: 5px;
    padding: 30px 50px 0;
    position: absolute;
    top: 200px;
    right: 150px;
    .login-header{
	    display: inline-block;
	    width: 100%;
	    height: 100%;
	    color: #666;
	    font-size: 24px;
	    text-align: center;
    }
  }
  .host{
    float: right;
    line-height: 35px;
    margin-right: 25px;
  }
  .input-container {
    font-size: 12px;
    margin-bottom: 10px;
    color: #666;
    position: relative;
    margin-left: 0;
    margin-right: 0;
    height: auto;
    zoom: 1;
    display: block;
    height: 50px;
    outline: none;
    .input-box{
    	display: block;
    	width: 100%;
    	float: left;
	    -webkit-box-flex: 0;
	    -ms-flex: 0 0 auto;
	    flex: 0 0 auto;
	    height: 35px;
    }
    span.input-placeholder {
	    font-size: 14px;
	    position: absolute;
	    top: -25px;
	    left: 0;
	    font-weight: 400;
	    -webkit-transform: translateY(25px);
	    transform: translateY(25px);
	    color: #666;
	    -webkit-transition: all .5s;
	    transition: all .5s;
	    cursor: text;
	    z-index: 1;
	    line-height: 32px;
	    &.focus{
	    	top: -50px;
	    	color: #5cadff;
    		font-size: 12px;
	    }
	    &.fill{
	    	font-size: 12px;
    		top: -50px;
	    }
		}
		.input-icon{
			position: absolute;
	    top: 0;
	    right: 0;
	    visibility: visible;
	    width: 32px;
	    height: 32px;
	    line-height: 32px;
	    text-align: center;
	    font-size: 18px;
	    -webkit-animation: zoomIn .3s cubic-bezier(.12,.4,.29,1.46);
	    animation: zoomIn .3s cubic-bezier(.12,.4,.29,1.46);	    
	    text-rendering: optimizeLegibility;
	    -webkit-font-smoothing: antialiased;
	    -moz-osx-font-smoothing: grayscale;
	    cursor: pointer;
	    z-index: 3;
		}
    input {
	    padding-left: 10px;
	    width: 100%;
	    border-radius: 0!important;
	    border-top: 0;
	    border-left: 0;
	    border-right: 0;
	    background: transparent !important;
	    height: 35px;
	    padding: 6px 7px;
	    outline: none;
      position: absolute;
    	z-index: 2;
    	box-sizing: border-box; 
	    font-size: 14px;
    	color: #000;
	    &:focus{
	    	border-color: #5cadff !important;	    	
	    }
		}
	}
  .box-input{
  	position: relative;
    display: inline-block;
    padding: 4px 7px;
    width: 100%;
    height: 28px;
    cursor: text;
    font-size: 12px;
    line-height: 1.5;
    color: #666;
    background-color: #fff;
    background-image: none;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    -webkit-transition: border .2s cubic-bezier(.645,.045,.355,1),background .2s cubic-bezier(.645,.045,.355,1),box-shadow .2s cubic-bezier(.645,.045,.355,1);
    transition: border .2s cubic-bezier(.645,.045,.355,1),background .2s cubic-bezier(.645,.045,.355,1),box-shadow .2s cubic-bezier(.645,.045,.355,1);
    outline: none;
  }
  .btn-login {
    font-size: 16px;
    width: 100%;
    height: 44px;
    padding: 0;
    background-color: #2db7f5;
    color: #fff;
    border-color: #57c5f7;
    border-radius: 6px;
    outline: 0;
    border: 1px solid transparent;
	}
	.captcha-contanier {
    margin-bottom: 10px;
    .captcha-wrap {      
      width: 140px;
      position: relative;  
      float: right;    
    }
    .img-wrap {
      display: inline-block;
      vertical-align: middle;
      cursor: pointer;
    }
  }
  .footer{
  	text-align: center;
    color: #666666;
    margin-top: 50px;
    width: 100%;
    font-size: 12px;
  }  
  
  @media screen and (max-width: 768px) {
    .box-login{
    	position: relative;
    	top: 0;
    	right: 0;
    }
    
  }

  .box-login-style2{
    top: auto;
    width: 1200px;
    height: 630px;
    padding: 0;
    right:auto;
  }

  .login-div-style2{
    height: 100%;
    width: 360px;
    background-color: #ffffff;
    float: right;
  }

  .login-contanier-style2{
    position: absolute;
    margin: auto;
    top: 30px;
    right: 50px;
    bottom: 0;
    width: 260px;
    height: 408px;
  }

  .login-header-style2{
    height: 50px !important;
  }
  .lang-switch{
    color:#39f;
  }
</style>
