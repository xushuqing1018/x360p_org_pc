<template>
	<div class="preview-home-page bg-darker-white">
		<div class="preview-mobile-mine">
			<div class="mine-header">
				<div class="content">
					<div class="header-avatar pull-left">
						<img src="http://s1.xiao360.com/common_img/avatar.jpg"/>				
					</div>
					<div class="header-info pull-left">
						<span>XXX</span>
						<p class="mt-3">186****6286</p>
					</div>
				</div>
			</div>
			
			<div class="mine-menu">
				<div class="x-mine-cell" v-for="item in data.config.my_menu" v-if="item.enable">
					<div class="cell-img">
						<img class="cell-icon" :src="item.icon" v-if="item.icon.indexOf('.')>-1">
						<Icon class="cell-icon" :type="item.icon" v-else></Icon>
					</div>
					<div class="cell-title">
						<p>{{item.label}}</p>
					</div>
					<Icon type="ios-arrow-right"></Icon>
				</div>
			</div>
		</div>
		
		<div class="tabbar bg-white">
			<div class="tabbar-item">
				<div class="tabbar-icon">
					<img src="/static/img/student/home.png">
				</div>
				<div class="tabbar-label">首页</div>
			</div>
			<div class="tabbar-item">
				<div class="tabbar-icon">
					<img src="/static/img/student/class.png">
				</div>
				<div class="tabbar-label">班级</div>
			</div>
			<div class="tabbar-item">
				<div class="tabbar-icon">
					<img src="/static/img/student/student.png">
				</div>
				<div class="tabbar-label">学员</div>
			</div>
			<div class="tabbar-item bg-white">
				<div class="tabbar-icon">
					<img src="/static/img/student/mine_active.png">
				</div>
				<div class="tabbar-label">我的</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default{
		props: {
			data: {
				type: Object,
				default() {
					return []
				}
			}
		},
	}
</script>

<style lang="less">
.preview-mobile-mine {
	.mine-header{
	    height: 150px;
	    background: url(/static/img/org/bg_banner.png) no-repeat;
		background-size: 100% 100%;    
	    position: relative;	  
	    .content{
	    	padding: 35px 10px 10px 30px;
	    	-webkit-box-sizing: border-box;
	   		box-sizing: border-box;
	   		color: #fff;
	   		position: absolute;
	   		left: 0;
	   		top: 0;
	   		width: 100%;
	   		height: 100%;
	   		z-index: 10;
	    }
	    .header-avatar{
	    	width: 70px;
	    	height: 70px;
	    	margin-right: 15px;
	    	img{
	    		border-radius: 50%;
			    width: 100%;
			    height: 100%;
			    vertical-align: middle;
	    	}
	    }
	    .header-info{
	    	height: 70px;
		    box-sizing: border-box;
		    
		    span{
		    	font-size: 18px;
		    	&.text-small{
		    		font-size: 13px;
		    	}
		    }
		    p{
		    	font-size: 13px;
		    }
	    }
	}

	.mine-menu{
		margin-top: 10px;
		.x-mine-cell{
		    padding: 10px 15px;
		    display: flex;
		    align-items: center;
		    flex-direction: row;
		    background: #fff;
		    position: relative;
		   	
		    .cell-title{
		    	flex: 1;
		    	font-size: 14px;
		    	color: #666;
		    }
		    .cell-icon{
				width: 20px;
			    height: auto;
			    margin-right: 10px;
			    display: inline-block;
			    text-align: center;
			    color: #B5B5B5;
			    vertical-align: middle;
			}
		    
		    &:after{
	    	    content: " ";
			    position: absolute;
			    width: 96%;
			    left: 2%;
			    bottom: 0;
			    right: 0;
			    height: 1px;
			    border-bottom: 1px solid #D9D9D9;
			    color: #D9D9D9;
			    transform-origin: 0 100%;
			    transform: scaleY(0.5);
		    }
		    &:nth-last-child(1){
		    	&:after{
		    		border: none;	    		
		    	}
		    }
		}
	}
}

</style>