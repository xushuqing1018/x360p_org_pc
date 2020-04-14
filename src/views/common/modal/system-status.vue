<template>
	<div class="system-modal" v-transfer-dom v-if="show_flag" width="500">
		<div class="ivu-modal-mask" style="z-index:2060;"></div>
		<div class="ivu-modal-wrap" style="z-index:2061;">
			<div class="img-center">
				<img class="lock" src="https://sp1.xiao360.com/static/img/ui/pc/lock.png" v-if="mode!=='init-pay'"/>
				<img class="init-pay" src="https://sp1.xiao360.com/static/img/ui/pc/init-pay.png" v-else/>
			</div>
			<span :class="{frozen: mode==='frozen'}">{{text}}</span>
			<div style="padding:15px;">
				<a :href="vip" target="_blank" class="ivu-btn ivu-btn-primary ivu-btn-long">前往续费</a>
			</div>
			<div style="padding-left:15px;padding-right:15px;" v-if="show_parent_btn">
				<span @click="requestParent" class="ivu-btn ivu-btn-default ivu-btn-long">请求总部支持</span>
				<span @click="close" class="ivu-btn ivu-btn-error ivu-btn-long" style="margin-top:10px;">关闭弹窗体验功能</span>
			</div>
		</div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	export default {
		props: {
			mode: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				show_flag: false
			}
		},
		methods: {
			show () {
				this.show_flag = true
				this.check_client()
				
			},
			close(){
				this.show_flag = false
			},
			check_client(){
				this.$http.get('index/clientinfo')
				.then(response=>{
					this.$store.commit('updateClient',response.body.data)
					if(response.body.data.is_init_pay == 1 && !response.body.data.is_expire){
						if(!response.body.data.is_expire){
							this.$emit('close')
							this.close()
						}
					}else{
						setTimeout(()=>{
							this.check_client()
						},3000)
					}
				})
			},
			requestParent(){
				this.$router.push({path: '/support'})
      			this.$emit('close')
      			this.close()
			}
		},
		computed: {
			text() {
				let map = {'init-pay':'系统还未开通','expire':'您的系统已过期','frozen':'您的系统已冻结'}
				return map[this.mode]
			},
			vip() {
				let info = this.$store.state.user.info,
					url  = info.product_url.split('//'),
					token = info.token,
					charge = ''
				charge = util.sprintf("%s//vip.%s/#/base?token=%s",url[0],url[1],token)
				return charge
			},
			show_parent_btn(){
				return this.$store.state.client.parent_allow_sub_org_type
			}
		}
	}
</script>
<style lang="less">
	.system-modal {
		.ivu-modal-mask {
			opacity: 0.8;
			background: #000;
		}
		.ivu-modal-wrap {
			background: #fff;
			width: 700px;
			height: 550px;
			margin: 180px auto;
			border-radius: 20px;
			.img-center{
				text-align:center;
			}
			img.lock {
				width:300px;
				
			}
			img.init-pay {
				width:300px;
			}
			span {
				display: block;
				text-align: center;
				font-size: 14px;
				padding-top: 10px;	
			}
			.frozen {
				padding-top: 40px !important;
				font-size: 18px;
			}
		}
	}
</style>