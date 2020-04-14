<template>
	<div class="c-grid">
		<Alert show-icon v-if="org_type==2">
			提示
			<p slot="desc">功能受限，请联系校区督导开通。</p>
		</Alert>
		<div class="box">
			<div class="fast-box">
				<div class="icon" :class="{'icon-disable':limited}" @click="tickets"><Icon type="clipboard" size="26"></Icon></div>
				<div class="text">工单记录</div>
			</div>
			<div class="fast-box">
				<div class="icon" :class="{'icon-disable':limited}" @click="services"><Icon type="heart" size="26"></Icon></div>
				<div class="text">服务记录</div>
			</div>
			<div class="fast-box">
				<div class="icon" @click="shopping"><Icon type="ios-cart" size="26"></Icon></div>
				<div class="text">商城系统</div>
			</div>
			<div class="fast-box">
				<div class="icon" :class="{'icon-disable':limited}" @click="calculator"><Icon type="ios-calculator" size="26"></Icon></div>
				<div class="text">运营计算器</div>
			</div>
			<div class="fast-box">
				<div class="icon" :class="{'icon-disable':limited}" @click="report"><Icon type="ios-paper-outline" size="26"></Icon></div>
				<div class="text">关键指标报表</div>
			</div>
			<div class="fast-box">
				<div class="icon" :class="{'icon-disable':limited}" @click="training_signup"><Icon type="man" size="26"></Icon></div>
				<div class="text">培训报名</div>
			</div>
			<div class="fast-box">
				<div class="icon" :class="{'icon-disable':courseFileLimited}" @click="courseFile"><Icon type="ios-bookmarks-outline" size="26"></Icon></div>
				<div class="text">总部课标</div>
			</div>
		</div>
	</div>
</template>
<script>
	import common from '@/libs/common.mixin'
	export default {
		mixins: [common],
		data() {
			return {
				
			}
		},
		computed:{
			limited(){
				if(this.org_type == 2){
					return true
				}
				return false
			},
			courseFileLimited(){
				if(
					(this.is_orgs && this.is_admin) || 
					(!this.is_orgs && this.rids_user.indexOf(3) !== -1)
				){
					return false
				}
				return true
			}
		},
		methods: {
			is_limited(){
				if(this.org_type == 2){
					this.error('功能受限，请联系校区督导开通。')
					return true
				}
				return false
			},
			tickets() {
				/*this.$Message.info('暂未开放，敬请期待！');
				return*/
				if(this.is_limited()){
					return
				}
				this.$router.push('./tickets')
			},
			services() {
				/*this.$Message.info('暂未开放，敬请期待！');
				return*/
				if(this.is_limited()){
					return
				}
				this.$router.push('./services')
			},
			shopping() {
				window.open('http://store.smart-art.com.cn/login/tklogin?token='+this.$store.state.user.token)
			},
			calculator () {
				if(this.is_limited()){
					return
				}
				this.$Modal.open("app/modal/operation-calculator-modal.vue")
				.then(modal=>{
					modal.show('运营计算器')
				})
			},
			report() {
				if(this.is_limited()){
					return
				}
				this.$router.push('/reports/ki')
			},
			courseFile() {
				if(this.courseFileLimited){
					return
				}
				this.$router.push('./csf')
			},
			training_signup(){
				if(this.is_limited()){
					return
				}
				this.$Message.info('暂未开放，敬请期待！');
				return
			}
		}
	}
</script>
<style lang="less" scoped>
	.box {
		display: flex;
		flex-wrap: nowrap;
    	justify-content: flex-start;
    	align-items: center;
	}
	.fast-box {
		flex: 0 0 10%;
		text-align: center;
		.icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 60px;
			height: 60px;
			border-radius: 15%;
			background: #3399FF;
			color: #fff;
			margin: 10px auto;
		}
		.icon-disable{
			background:#cccccc !important;
		}
	}
</style>