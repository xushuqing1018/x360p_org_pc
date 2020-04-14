<template>
	<div>
		<wxmp-list 
		:list="data" 
		@on-change-default-mp="changeDefaultMp" 
		@on-manage-mp="manageMp"
		@on-view-qrcode="viewQrCode"
		@on-add-mp="mpAdd"
		v-if="action == 'list'"
		>
		</wxmp-list>
		<wxmp-detail 
		:info="mpinfo"
		@on-back-list="backList"
		@on-mp-delete="mpDelete"
		@on-mp-update="mpUpdate"
		v-if="action=='detail'"
		>
		</wxmp-detail>
    </div>
</template>

<script>
	import util from '@/libs/util'
	import config from '@/libs/config.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import directive from '@/libs/directive.mixin'
	
	
	import wxmpList from './wxmp-list.vue'
	import wxmpDetail from './wxmp-detail.vue'
	
	
	
	export default{
		mixins:[common,config,globals,directive],
		components: {
			wxmpList,
			wxmpDetail
		},
		computed:{
			isBase () {
				let user = this.$store.state.user.info				
				return user.x_sub_host!='base'
			},
			data () {
				let data = this.$store.state.gvars.public_accounts
				if(data.length>1){
					data = data.filter(d=>!d.system_default)
				}
				return data
			},
           	branchs () {
           		let list = this.$store.state.gvars.branchs
           		return list.filter(l=>l.appid==this.appId)
           	},
           	bids$ () {
           		let branchs = this.$store.state.gvars.branchs,
           			list = branchs.filter(l=>l.appid==this.appId), 
           			bids = []
           			
           		list.forEach(l=>{
           			bids.push(l.bid)
           		})
           		
           		return bids
           	}
        },
		data () {
			return {
				action:'list',
				mpinfo:null			
			}
		},
		watch: {
			'$store.state.branch.id':{
				handler:function(bid,old_bid){
                    this.init_wx_config()
	            },
				deep: true
			}
		},
		mounted () {			
			this.init()
		},
		methods:{
			init () {
				this.$store.dispatch('updateGlobalVar','public_accounts')
				.then(()=>{
					this.init_wx_config()	
				})
			},
			
			setCurrentIndex (index) {
				this.currentIndex = index||0
			},
			addInfo () {
				this.$refs['add'].show('添加公众号授权','add')
			},
			changeDefaultMp (item) {
				this.confirm('更换默认公众号操作很简单，用个人微信扫个码就可以了，前提是您现在需要先准备好 <strong color="red">拥有公众号管理权限</strong> 的个人微信，并且公众号必须是服务号，不能是订阅号，您确定已经准备好了吗？')	
				.then(()=>{
					let href = location.href,
						base_url = this.$store.state.user.info.product_url,
						cid = this.$store.state.user.info.client.cid,
						token = this.$store.state.user.token,
						uri = util.sprintf('%s/api/authorize?token=%s&cid=%s&href=%s',base_url,token,cid,href)
					uri = uri.replace(/#/g,'$')
					location.href = uri
				})			
				
			},	
			manageMp(item){
				this.mpinfo = util.copy(item)
				this.action = 'detail'
			},
			backList(){
				this.action = 'list'
				this.mpinfo = null
			},
			viewQrCode(url){

			},
			init_wx_config () {				
				let appid = this.$route.query.appid
				if(appid){
					let wxmp = this.data.find(d=>d.authorizer_appid==appid)
					if(wxmp){
						this.confirm('新的公众号"'+wxmp.nick_name+'"已经接入到系统，还需要进行模板消息ID设置,点击确认进入模板公众号模板设置界面')
						.then(()=>{
							this.manageMp(wxmp)						
						})
					}
				}
			},
			mpDelete(item){
				this.confirm('确认要删除公众号:'+item.nick_name+'吗？')
				.then(()=>{
					this.$rest('wxmps')
					.delete(item.wxmp_id)
					.success(response=>{
						this.$Message.success('删除成功')
						this.init()
					})
					.error(res=>{
						this.error(res.body.message)
					})
				})
			},
			mpUpdate(item){
				this.$rest('wxmps')
				.add_url_param(item.wxmp_id)
				.put()
				.success(response=>{
					this.$Message.success('更新成功！')
					this.init()
				}).error(response=>{
					this.error(response.body.message||'更新失败')
				})
			},
			mpAdd(){
				this.$Modal.open('system/configs/wxmp/wxmp-add-modal.vue')
				.then(modal=>{
					modal
					.show('添加微信公众号授权')
				})
			}
		}
	}
</script>

<style lang="less">
	@import '~@/style/wxmp.less';
</style>