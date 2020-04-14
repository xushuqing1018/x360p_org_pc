<template>
	<div class="c-grid bg-white">
		<div class="row">
			<div class="col-md-6">
				<ui-tab :info="info.mobile" @on-save="handleSubmit"></ui-tab>
			</div>
			<Card dis-hover>
				<span slot="title">登录界面预览</span>
				<ui-preview :info="info.mobile"></ui-preview>
			</Card>
		</div>
	</div>
</template>

<script>	
	import {_} from '@/libs/util'
	import globals from '@/libs/globals.mixin'
	import uiTab from '@/views/system/configs/ui/tab-mobile'
	import uiPreview from '@/views/system/configs/ui/preview-mobile.vue'
	import Clipboard from 'clipboard'
	import common from '@/libs/common.mixin'
	
	var clipboard = null
	export default{
		mixins: [common,globals],
		components: {
			uiTab,
			uiPreview
		},
		mounted () {		
			//dom加载完毕后绑定事件
			clipboard = new Clipboard('.copy-btn')
			clipboard.on('success', (e)=> {
			    this.$Message.success('复制成功！')			
			    e.clearSelection()
			})
		},
		destroyed () {			
			//离开页面时销毁
			clipboard.destroy()
		},
		computed: {
			info () {
				let client = this.$store.state.client,
					result = client.params
					
				return result
			}
		},
		methods: {
			handleSubmit () {				
				let [method,uri] = (this.action==='add'?['post','configs/edit_center_params']:['put','configs/edit_center_params'])
				
				let params = {
					cid: this.$store.state.client.cid,
					params: {}
				}
				params.params['mobile'] = this.info['mobile']
				
				this.$http[method](uri,params)
				.then(response=>{
					let user = {
						client: {
							params: this.info
						}
					}
					this.$Message.success('保存成功!')
					this.$store.commit('updateUserInfo',{user:user,action:'changeUI'})
					
				})
				.catch(response=>{
					this.error(response.message)
				})
			}
		}
	}
	
</script>

<style>
</style>