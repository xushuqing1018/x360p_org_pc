<template>
	<div class="login-layout">
		<div class="logo">
			<img :src="info.logo">
		</div>
		<div class="form">	        
		    <div class="x-login-box">
	    		<div>
	          		<input readonly type="text" placeholder="手机号" />
	          	</div>
	          	<div>
	          		<input readonly placeholder="密码"/>
	          	</div>
	        </div> 
	        <div class="bottom">
	            <button class="x-btn x-btn-lg" type="primary">登录</button>
	        </div>
	        <div class="bottom-link">
	        	<a>注册账号</a>
	        	<span>|</span>
	        	<a>忘记密码?</a>
	        </div>
		</div>
	</div>
</template>

<script>
	export default{
		props: {
			info: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		}
	}
</script>


<style lang="less" scoped>
 @import '~@/style/mixin.less';

input::-webkit-input-placeholder {
    color: #CCCCCC;
    font-size: 12px;
}
.error-tip{
  color:#f00;
  padding:5px 15x;
}
.login-layout{
	background:#fff;
    width: 375px;
    height: 667px;
    margin: 0 auto;
    border: 1px solid #f1f1f1;
	.logo{
		padding-top:60px;
		text-align:center;
		img{
			border-radius: 19px;
			max-width: 100%;
		    max-height: 70px;
		}
	}	
	.form{
		background:#fff;
		padding:50px 20px;
		
		.x-login-box{
			border: 1px solid #eeeeee !important;
			border-radius: 3px !important;
			div{
				padding: 10px 15px;
				position: relative;
				&:nth-child(2):before{
				    content: " ";
				    position: absolute;
				    left: 0;
				    top: 0;
				    right: 0;
				    height: 1px;
				    border-top: 1px solid #D9D9D9;
				    color: #D9D9D9;
				    -webkit-transform-origin: 0 0;
				    transform-origin: 0 0;
				    -webkit-transform: scaleY(0.5);
				    transform: scaleY(0.5);
				    left: 15px;
				}
				input{	
				    width: calc(~"100% - 30px");
				    border: 0;
				    outline: 0;			    			    
				    -webkit-appearance: none;
				    background-color: transparent;
				    font-size: inherit;
				    color: inherit;
				    height: 1.41176471em;
				    line-height: 1.41176471;			    
				}
			}
			
		}
		.bottom{
			margin-top:30px;
			.x-btn{
				background-color:#38C4FF !important;
			    position: relative;
			    display: block;
			    width: 100%;
			    margin-left: auto;
			    margin-right: auto;
			    padding-left: 14px;
			    padding-right: 14px;
			    -webkit-box-sizing: border-box;
			    box-sizing: border-box;
			    font-size: 18px;
			    text-align: center;
			    text-decoration: none;
			    color: #FFFFFF;
			    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
			    overflow: hidden;	
			    height: 36px;
			    line-height: 36px;
			    font-size: 14px;
			    border-radius: 3px;		
			    border:none;	
			}	
		}

		.bottom-link{
			margin-top:15px;
			text-align: center;
			font-size: 14px;
			span {
				color: #EEEEEE;
				margin: 0 16px;
			}
			a{
				color: #AAAAAA;
				&:nth-child(1){
					color: #38C4FF;	
				}				
			}
		}
	}
}

</style>