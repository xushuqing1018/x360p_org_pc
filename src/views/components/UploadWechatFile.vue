<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" @on-cancel="cancel" width="520">
		
		<div class="row">
			<div class="col-md-12">
				<Alert show-icon type="success" v-if="uploadFile.length">
					上传成功
					<div slot="desc">
						<p class="mt-1 mb-0" v-for="item in uploadFile">
							您上传了一个
							<a :href="item.file_url" target="_blank">【{{map_type[item.media_type]}}】</a>
							文件
						</p>
					</div>
				</Alert>
				<div class="text-center">
					<img :src="qrcode_url" title="打开微信扫描二维码">
					<p class="text-desc mt-2 text-center"><Icon type="qr-scanner"></Icon> 打开微信扫描二维码</p>
				</div>
			</div>
		</div>
		
		<div slot="footer">
			<Button type="ghost" @click="cancel">关闭</Button>
		</div>
	</Modal> 
</template>

<script>
	import {_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import qrcode from 'c%/qrcode'	
	
	export default{
		mixins: [ modal ],
		components: {
			qrcode
		},
		props: {
			loop: {
				type: Boolean,
				default: true
			}
		},
		data () {
			return {
				qrcode_url: '',
				uploadSuccess: false,
				uploadFile: [],
				map_type: {'image':'图片','voice':'语音','video':'视频'}
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val&&this.loop){
					this.uploadSuccess = false
					this.getUploadStatus()
				}
			}
		},
		created () {			
			this.getQrcode()			
		},
		methods: {
			cancel () {
				this.uploadSuccess = true
				if(this.getUploadStatus){
					window.clearInterval(this.getUploadStatus)
				}				
				this.close()
			},			
			getUploadStatus () {
				this.$rest('files/recent_file')
				.get()
				.success(data=>{
					if(!_.isEmpty(data)){
						let index = this.uploadFile.findIndex(u=>u.file_id==data.file_id)
						if(index==-1){
							this.uploadFile.push(data)
							this.$emit('on-success',data)
							setTimeout(()=>{
								this.cancel()
							},1000)
						}
					}					
				})
				if(!this.uploadSuccess){
					window.setTimeout(this.getUploadStatus,3000)
				}
			},			
			getQrcode () {
				let uid = this.$store.state.user.info.uid
				
				this.$rest('/api/users/'+uid+'/wechat_qrcode?code_type=upload_file')
				.get()
				.success(data=>{
					console.log(data)
					this.qrcode_url = data.url 
				}).error(response=>{
					console.log('获取失败~')
					console.log(response)
				})
			}
		},
		computed: {
//			qrcode () {
//				let result = '',
//					accounts = this.$store.state.gvars.public_accounts,
//					default_account = {}
//					
//				if(accounts.length){
//					//客户自己默认公众号
//					default_account = accounts.find(a=>a.is_default)
//					
//					if(!default_account){
//						//系统默认公众号
//						default_account = accounts.find(a=>a.system_default)
//					}
//					result = default_account.qrcode_url
//				}
//				
//				return result
//			}
		}
	}
</script>

<style>
</style>