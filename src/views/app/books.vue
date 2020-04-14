<template>
	<div class="app-center-layout">
		<div class="app-body-bg">			
		</div>
		<div class="app-center-body">
			<div class="app-center-menu">
				<div class="app-center-menu-item" @click="borrowInfo">
					<img src="http://s1.xiao360.com/book-borrow.png">
					<p>借书</p>
				</div>
				<div class="app-center-menu-item" @click="borrowRecord">
					<img src="http://s1.xiao360.com/book-return.png">
					<p>还书</p>
				</div>
				<div class="app-center-menu-item" @click="bookManage">
					<img src="http://s1.xiao360.com/book-store.png">
					<p>书库</p>
				</div>
				<!--<div class="app-center-menu-item">
					<img src="http://s1.xiao360.com/book-search.png">
					<p>查询</p>
				</div>-->
			</div>
		</div>
	</div>
</template>

<script>
	export default{
		methods: {
			bookManage () {
				this.$router.push('./booksl')
			},
			borrowInfo () {
				this.$Modal.open('app/books/borrow-modal.vue')
				.then(modal=>{
					modal.show('借书')
				})
			},
			borrowRecord () {
				let title = '借阅记录'							
				
				this.$Modal.open('app/books/borrow-record.vue@modal')
				.then(modal=>{
					modal.show(title)
				})
			},
		}
	}
</script>

<style lang="less" scoped>
.sidebar-minimized.sidebar-fixed .main{
	.app-center-layout{
		width: calc(~"100% - 50px");
		left: 50px;
	}	
} 

.app-center-layout{
	width: calc(~"100% - 200px");
	height: calc(~"100% - 173px");
	position: absolute;
	top: 123px;
	left: 200px;
	overflow: hidden;
	transition: all .3s;
	
	.app-body-bg{
		width: 100%;
		height: 100%;
		background-image: url('http://s1.xiao360.com/app-book-bg.jpg');
		z-index: 2;
		position: absolute;		
	    filter: blur(3px);    
	    opacity: 1;	
	}
	
	.app-center-body{
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		z-index: 3;		
		
		.app-center-menu{
			display: flex;
			
			.app-center-menu-item{
				width: 200px;
				height: 200px;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #fff;
				font-size: 18px;
				background:#3399FF;
				margin-right: 96px;
			    flex-direction: column;
			    cursor: pointer;
			    border-radius: 10px;
			    transition: all .3s;
			    
			    &:nth-child(2){
			    	background: #00CCBB;
			    }
			    &:nth-child(3){
			    	background: #9333FF;
			    }			    
				&:nth-last-child(1){
					background: #FF6600;
					margin-right: 0;
				}
				img{
					width: 96px;
					margin-bottom: 16px;
				    
				}
				&:hover{
				    transform: scale(1.1) translateY(-5px);    				
				}
			}
			
			
		}
	}
}
</style>