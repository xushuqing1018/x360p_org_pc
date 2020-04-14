<template>
	<div class="box" :style="{background: 'url('+ info.login_img + ') no-repeat center center'}">
	   	<div class="box-login" :style="{background: login_box_bg}" :class="{ 'box-login-style2': login_box_bg != '#fff'}">
	    	<div class="login-contanier" :class="{ 'login-contanier-style2': login_box_bg != '#fff'}">
		      <p class="login-header" :class="{ 'login-header-style2': login_box_bg != '#fff'}">
				  <img height="50px" :src="login_box_title_logo" style="position:relative;bottom:10px;"/> 
				  <br v-if="login_box_title_logo != ''"/>
				  {{info.system_name}}
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
		            <img :src="captchaUrl"/>
		          </div>
		        </div>
		        
		        <button class="btn-login mb-2" :style="{background: info.login_box_btn_color}">登录</button>
		        <div class="forget_pw cursor text-info pull-right" >忘记密码?</div>
		        <footer class="footer">
				      <span v-html="info.copyright"></span>
				    </footer>
		      </div>
	    	</div>   
    	</div> 
	</div>
</template>

<script>
	import directive from '@/libs/directive.mixin'
	export default{
		mixins: [ directive ],
		props: {
			info: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		data () {
			return {
				accountFocus: false,
			    captchaFocus: false,
			    passwordFocus: false,
			    formLogin: {
			      	account: '',
			      	password: '',
			      	captcha: ''
			    },
			    captchaUrl:'/api/captcha',
			}
		},
		computed: {
			login_box_bg (){
    		  	let result = '#fff'
    			if(this.info.login_box_style == 2 && this.info.login_box_bg != ''){
    				result = 'url('+ this.info.login_box_bg + ') no-repeat center center'
    			}
    			return result
    		},
    		login_box_title_logo (){
    		  let result = ''
    			if(this.info.login_box_style == 2 && this.info.login_box_title_style == 2 && this.info.login_box_title_logo!= ''){
    				result = this.info.login_box_title_logo
    			}
    			return result
    		},
    		login_box_btn_color (){
    		  let result = ''
    			if(this.info.login_box_btn_color != ''){
    				result = this.info.login_box_btn_color
    			}
    			return result
    		},
    		login_content (){
    		  let result = '#fff'
    			if(this.info.login_box_style == 2 && this.info.login_box_bg != ''){
    				result = 'none'
    			}
    			return result
    		}
		},
		methods: {
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
		}
	}
</script>

<style lang="less" scoped>
  @import '~@/style/mixin.less';
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
    width: calc(~"100% - 30px");
    position: absolute;
    height: calc(~"100% - 73px");
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
    padding: 20px;
    margin: 0 auto;
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
</style>
