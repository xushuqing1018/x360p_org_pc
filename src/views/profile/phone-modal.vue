<template>
	<div class="custom-modal-mask" v-transfer-dom :data-transfer="true" v-show="modal$.show">		
		<div class="ivu-modal-mask" style="z-index: 2009;"></div>
		<div class="mobile-preview" v-if="modal$.show">
			<div class="mobile-preview-hd">
				<strong class="nickname">{{modal$.title}}</strong>
			</div>			
			<div class="mobile-preview-bd">
				<div class="mobile-preview-header" :style="{backgroundImage: 'url('+info.background_img+')'}">
					<div class="avatar">
						<img :src="info.avatar">
					</div>
				</div>
				<div class="mobile-preview-content" v-html="info.introduce"></div>
			</div>
			<div class="mobile-preview-ft"></div>
			<button class="mobile-preview-closed" @click="close">退出预览</Button>
		</div>
	</div>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	
	export default{
		mixins: [modal],
		data () {
			return {
				info: {}
			}
		},
		methods: {
			
		}
	}
</script>

<style lang="less">
	.mobile-preview-header{
		height: 175px;
		background-size: 100% 100%;
		background-repeat: no-repeat;
	    position: relative;
		.avatar{
		    width: 65px;
		    height: 65px;
		    margin: 0 auto;
		    display: block;
		    position: absolute;
		    text-align: center;
		    left: calc(~"50% - 32px");
		    top: calc(~"100% - 32px");
		    border: 2px solid #fff;
    		border-radius: 50%;
			img{
				width: 100%;
				height: 100%;
				border-radius: 50%;
			}
		}
	}
	.mobile-preview {
	    position: fixed;
	    top: 50%;
	    left: 50%;
	    width: 327px;
	    margin-top: -425px;
	    margin-left: -161px;
	    z-index: 9999;
	    background: transparent url(../../img/bg-mobile21d289.png) no-repeat 0 0;
	    .mobile-preview-hd {
		    height: 150px;
		    text-align: center;
		    .nickname {
			    display: inline-block;
			    font-weight: 400;
			    padding-top: 120px;
			    width: 122px;
			    overflow: hidden;
			    text-overflow: ellipsis;
			    white-space: nowrap;
			    word-wrap: normal;
			    font-size: 14px;
			    color: #fff;
			}
		}
		.mobile-preview-bd {
		    position: relative;
		    height: 393px;
		    margin-left: 40px;
		    margin-right: 28px;
		    overflow-y: scroll;
		    .mobile-preview-content{
		    	margin-top: 45px;
		    	line-height: 2em;
		    }
		}
		.mobile-preview-ft {
		    height: 152px;
		    
		    .pre-menu-list{
		    	margin-left: 65px;
    			margin-right: 36px;
    			&:after{
				    content: "";
				    display: block;
				    height: 0;
				    clear: both;
    			}    			
		    }
		}
		.mobile-preview-closed {
		    position: absolute;
		    left: 112px;
		    display: inline-block;
		    padding: 6px 12px;
		    margin-bottom: 0;
		    font-size: 14px;
		    font-weight: 400;
		    line-height: 1.42857143;
		    text-align: center;
		    white-space: nowrap;
		    vertical-align: middle;
		    -ms-touch-action: manipulation;
		    touch-action: manipulation;
		    cursor: pointer;
		    -webkit-user-select: none;
		    -moz-user-select: none;
		    -ms-user-select: none;
		    user-select: none;
		    background-image: none;
		    border: 1px solid transparent;
		    border-radius: 4px;
	        color: #333;
    		background-color: #fff;
    		&:hover{
			    color: #333;
			    background-color: #e6e6e6;
			    border-color: #adadad;
    		}
		}
	}
	.custom-modal-mask{
	    position: fixed;
	    top: 0;
	    right: 0;
	    bottom: 0;
	    left: 0;
	    z-index: 1040;
	    display: block;
	    overflow: hidden;
	    -webkit-overflow-scrolling: touch;
	    outline: 0;
	}
</style>