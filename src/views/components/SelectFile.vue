<template>
	<Modal :title="modal$.title" v-drag-modal v-model="modal$.show" :mask-closable="false" width="700">
		<template v-if="modal$.show">
			<Tabs v-model="current_tab">
				<TabPane label="图片" name="image" v-if="selType==='image'||selType===''">
					<my-picture 
						ref="image" 
						:sel-img="image" 
						:multiple="multiple" 
						v-if="current_tab=='image'">
					</my-picture>
				</TabPane>
				<TabPane label="语音" name="voice" v-if="selType=='voice'||selType===''">
					<my-voice 
						ref="voice" 
						:sel-voice="voice" 
						:multiple="multiple" 
						v-if="current_tab=='voice'">
					</my-voice>
				</TabPane>
				<TabPane label="视频" name="video" v-if="selType=='video'||selType===''">
					<my-video 
						ref="video" 
						:sel-video="video" 
						:multiple="multiple" 
						v-if="current_tab=='video'">
					</my-video>
				</TabPane>
				 <TabPane label="文件" name="file" v-if="selType=='file'||selType===''">
					<other-file 
						ref="file" 
						:sel-file="file" 
						:multiple="multiple" 
						v-if="current_tab=='file'">
					</other-file>
				</TabPane> 
				<div slot="extra">
					<x-upload 
						v-if="!hideUploadBylocal"
						ref="handupload"	
						:format="format"
						:data="upload_post"    
						:show-upload-list="false"
						:headers="upload_header"						
						:on-format-error="handleFormatError"
						:on-exceeded-size="handleMaxSize"
						:on-success="handleSuccess"
						:on-error="handleError"
						style="display: inline-block;">						
						<Button type="ghost" size="small" icon="monitor">本地上传</Button>
					</x-upload>
					<Button size="small" type="ghost" icon="chatbubbles" @click="uploadByWechat">通过微信上传</Button>
				</div>
			</Tabs>
		</template>
		<div slot="footer">
			<span class="footer-selected pull-left" v-if="!multiple&&current_tab==='image'"><i>已选择:</i>{{labelText}}</span>
            <Button type="ghost" @click="close">取消</Button>
            <Button type="primary" @click="ok">确定</Button>
        </div>
        <upload-wechat-file :loop="true" ref="uploadWechat" size="small" @on-success="setTabAndRefresh"></upload-wechat-file>
	</Modal>	
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	import MyPicture from './selectfile/picture.vue'
	import MyVoice from './selectfile/voice.vue'
	import MyVideo from './selectfile/video.vue'
	import OtherFile from './selectfile/other-file.vue'
	import UploadWechatFile from 'c%/UploadWechatFile.vue'
	import XUpload from 'c%/xupload/index'
	
	const resName   = 'file'
	const idField   = 'file_id'
	const textField = 'file_name'

	export default {
		mixins: [modal,common],
		components: {
			XUpload,
			MyPicture,
			MyVoice,
			MyVideo,
			OtherFile,
			UploadWechatFile
		},
		props: {
			selType: {
				type: String,
				default: ''
			},
			multiple: {
				type: Boolean,
				default: false,
			},
			hideUploadBylocal: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				current_tab: "",
				image: [],
				voice: [],
				video: [],
				file: [],
				
			}
		},
		methods: {
			setTabAndRefresh (data) {
				if(data&&data.media_type){
					this.current_tab = data.media_type
				}
				setTimeout(()=>{
					this.$refs[this.current_tab].resetSearch()					
				},100)
			},
			uploadByWechat () {
				this.$r('uploadWechat')
				.show('通过微信上传文件')
			},
			ok() {
				let current = util.copy(this.current_tab)
				let files = ['image','voice','video','file']	
				
				if(this.image.length == 0&&this.voice.length==0&&this.video.length==0&&this.file.length==0) {
					this.$Message.error('您还未选择文件')
					return false
				}			
				
				
				if(!this.multiple) {
					let obj = this.$store.getters.getMapObject(this[current][0],resName)						
										
					this.$emit('selected',obj)
					
					if(current=='image'){						
						let image = new Image(),
							img_url = obj.file_url,
							img_name = obj.file_name
						
						image.setAttribute('crossOrigin', 'anonymous')
						image.onload = () => {
							let base64 = this.getBase64Image(image)
							this.$emit('select',{base64:base64,name:img_name})
							image.onload = null
						}
						image.src = img_url
					}
				}else{
					let data = []
					files.forEach(f => {
						this[f].forEach(i => {
							data.push(this.$store.getters.getMapObject(i,resName))
						})
					})
					this.$emit('selected',data)
				}
				this.close()
			},
			getBase64Image(img) {
				let canvas = document.createElement('canvas')
				canvas.width = img.width
				canvas.height = img.height
				let ctx = canvas.getContext("2d")
				ctx.drawImage(img,0,0,img.width,img.height)
				let ext = img.src.substring(img.src.lastIndexOf(".")+1).toLowerCase()
				let dataURL = canvas.toDataURL('image/'+ext)
				return dataURL
			},
			 handleFormatError (file) {
	        	let file_list = this.format.join(',')
	        	
	            this.$Notice.warning({
	                title:'文件格式不正确',
	                desc:'文件 ' + file.name + ' 格式不正确，请上传 '+file_list+' 格式的文件。'
	            });            
	        },
	        handleSuccess(res) {
	        	this.$Message.success('上传成功')
	        	if(this.selType) {
	        		this.$refs[this.selType].init_data()
	        	}else{
	        		this.$refs[this.current_tab].init_data()
	        	}
	        },
	        handleMaxSize (file) {
                this.$Notice.warning({
                    title: '超出文件大小限制',
                    desc: '文件 ' + file.name + ' 太大，不能超过 5M。'
                });
            },
            handleError(res,file,fileList){
            	this.$Notice.warning({
            		title:'上传文件失败',
            		desc:'文件'+file.name+'上传失败:'
            	})
            }
		},
		computed: {
			labelText() {
				if(this.image[0]&&!this.multiple) {
					return this.$store.getters.getMapObject(this.image[0],resName).file_name
				}else{
					return ''
				}
			},
			format () {
				let selType = this.selType,
					format = []
				if(selType=='image'){
					format = ['image','jpg','jpeg','png','gif','bmp']
				}else if(selType=='video'){
					format = ['video','rm','rmvb','mpeg1－4','mov','mtv','dat','wmv','avi','3gp','amv','dmv','flv','mp4']
				}else if(selType=='voice'){
					format = ['voice','amr','mp3','wav']
				}else if(selType=='file'){
					format = ['doc','txt','docx','pages','epub','pdf','numbers','csv','xls','xlsx','keynote','ppt','pptx']
				}
				return format
			},
			upload_header () {
                return {
                    'x-token':this.$store.state.user.token,
                    'x-file-key':'file'
                }
            },
            upload_post () {
                return {
                    mod:'correct_upload'
                }
            }
		},
		watch: {
			'modal$.show': function(val) {
				if(val) {
					if(this.selType==='' || this.selType==='image') {
						this.current_tab = 'image'
					}else if(this.selType==='voice') {
						this.current_tab = 'voice'
					}
				}
			}
		}
	}
</script>