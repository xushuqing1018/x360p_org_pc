<template>
	<Modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="450">
		<p class="mb-2">登录地址如下：</p>
		<Alert>
			<span class="text-primary cursor" @click="openNewWindow">
				{{loginUrl}}
			</span>
		</Alert>
		<Alert show-icon>点击上面的链接直接登录客户的系统</Alert>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	export default{
		mixins: [ modal ],
		data () {
			return {
				uid: 0,
				og_id: 0,
				loginUrl: ''
			}
		},
		watch: {
			og_id: function (val) {
				this.getToken()
			}
		},
		methods: {
			getToken () {
				this.$rest(`orgs/${this.og_id}/domktoken`).post({uid:this.uid})
				.success(response=>{
					this.loginUrl = response.data.url
				}).error(response=>{
					this.$Notice.error({
						title: '提示',
						desc: response.body.message||'获取登录地址错误~'
					})
				})
			},
			openNewWindow () {
				if(this.loginUrl){
					window.open(this.loginUrl)					
				}
			}
		}
	}
</script>

<style>
</style>