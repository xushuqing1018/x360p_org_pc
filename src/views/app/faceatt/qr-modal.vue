<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :mask-closable="false" width="340">
		<img :src="info.qrcode_url" width="300" height="300"/>
		<Spin fix v-if="loading">正在生成二维码...</Spin>
		<div slot="footer" class="text-center">
			<p class="x-code">
				<code :title="info.url">{{info.url}}</code>
			</p>
			<span>
				您可以 
				<span class="cursor text-info" @click="download">下载二维码</span> 
				或点击
				<span class="cursor text-info copy-btn" :data-clipboard-text="info.url">复制</span>
				将链接发送给家长
			</span>			
		</div>
		<a ref="downloadhref"></a>
	</Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import Clipboard from 'clipboard'
	var clipboard = null
	
	export default{
		mixins: [ common, modal ],
		props: {
			sid: Number
		},
		data () {
			return {
				info: {},
				loading: false
			}
		},
		mounted () {	
			this.getQrCode()	
			//dom加载完毕后绑定事件
			clipboard = new Clipboard('.copy-btn')
			clipboard.on('success', (e)=> {
			    this.$Message.success('复制成功！')			
			    e.clearSelection()
			})
		},
		methods: {
			getQrCode() {
				this.loading = true
				this.$rest('students/faceqr')
				.get({
					sid: this.sid
				})
				.success(res => {
					this.info = res
					this.loading = false
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			download () {
				var sampleImage = this.$refs.qrcode.$el.querySelector("img"),
			    	canvas = this.convertImageToCanvas(sampleImage),
			    	url = canvas.toDataURL("image/png"),
			    	downloadhref = this.$refs.downloadhref
			    
			    //以下代码为下载此图片功能
			    downloadhref.setAttribute("href",url)
			    downloadhref.setAttribute("download","qrcode.png")
			    			    
			    downloadhref.click()
			}
		},
		destroyed () {			
			//离开页面时销毁
			clipboard.destroy()
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