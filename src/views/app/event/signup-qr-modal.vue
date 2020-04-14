<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :mask-closable="false" width="340">
		
		<qrcode :size="300" :value="url" type="img"></qrcode>
		
		<div slot="footer" class="text-center">
			<p class="x-code">
				<code :title="url">{{url}}</code>
			</p>
			<span>
				截图发送给家长或点击
				<span class="cursor text-info copy-btn" :data-clipboard-text="url">复制</span>
				将链接发送给家长
			</span>
		</div>
		
	</Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import qrcode from 'c%/qrcode'
	import Clipboard from 'clipboard'
	var clipboard = null
	
	export default{
		mixins: [ modal ],
		components: {
			qrcode
		},
		data () {
			return {
				event_id: 0
			}
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
			url () {
				let user = this.$store.state.user
				
				return user.info.base_url+'/student#/event/list/'+this.event_id
			}
		}
	}
	
</script>

<style lang="less" scoped>
.x-code{
	code{
	    width: 100%;
	    white-space: nowrap;
	    overflow: hidden;
	    text-overflow: ellipsis;
	    display: block;
	    margin-bottom: 1em;
	}
}
</style>