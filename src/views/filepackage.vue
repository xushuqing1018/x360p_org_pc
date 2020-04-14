<template>
	<div class="c-grid">
		<div class="box box-result">
			<Tabs v-model="current_tab">
				<TabPane label="图片" name="image">
					<my-picture :size="pageSize" ref="image" :sel-img="image" :multiple="multiple" v-if="current_tab=='image'"></my-picture>
				</TabPane>
				<TabPane label="语音" name="voice">
					<my-voice :size="pageSize" ref="voice" :sel-voice="voice" :multiple="multiple" v-if="current_tab=='voice'"></my-voice>
				</TabPane>
				<TabPane label="视频" name="video">
					<my-video :size="pageSize" ref="video" :sel-video="video" :multiple="multiple" v-if="current_tab=='video'"></my-video>
				</TabPane>
				 <TabPane label="文件" name="file">
					<other-file :size="pageSize" :sel-file="file" :multiple="multiple" v-if="current_tab=='file'"></other-file>
				</TabPane>
				<div slot="extra">
					<Poptip trigger="hover" :title="'已选择：'+total" transfer placement="bottom">
						<Button type="text">已选择：{{total}}</Button>						
				        <div slot="content" v-html="chooseContent"></div>
				    </Poptip>
				    <ButtonGroup>							
						<Button type="primary" icon="paper-airplane" :disabled="total==0" @click.native="pushFiles">推送</Button>
						<Button type="error" icon="ios-trash" :disabled="total==0" @click.native="delFiles">删除</Button>
						<Button icon="close" title="清空" :disabled="total==0" @click.native="clearSelect">清空</Button>
					</ButtonGroup>
					<Dropdown trigger="click">						
						<Button type="ghost" icon="arrow-down-b">上传文件</Button>
						
						<DropdownMenu slot="list">
							<DropdownItem @click.native="uploadByLocal">
								<Icon type="ios-cloud-upload-outline"></Icon> 本地上传
							</DropdownItem>
							<DropdownItem @click.native="uploadByWechat">
								<Icon type="chatbubbles"></Icon> 微信上传
							</DropdownItem>
						</DropdownMenu>								
					</Dropdown>
					<Button type="ghost" @click="get_history">推送历史</Button>	    
			  	</div>				
			</Tabs>
			<upload-wechat-file :loop="true" ref="uploadWechat" size="small" @on-success="setTabAndRefresh"></upload-wechat-file>
		</div>
	</div>
</template>

<script>
	import util,{_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import fileMixin from 'c%/selectfile/file.mixin'
	import MyPicture from 'c%/selectfile/picture.vue'
	import MyVoice from 'c%/selectfile/voice.vue'
	import MyVideo from 'c%/selectfile/video.vue'
	import OtherFile from 'c%/selectfile/other-file.vue'
	import UploadWechatFile from 'c%/UploadWechatFile.vue'
	
	const resName   = 'file'
	const idField   = 'file_id'
	const textField = 'file_name'
	
	export default{
		mixins: [ common, fileMixin ],
		components: {
			MyPicture,
			MyVoice,
			MyVideo,
			OtherFile,
			UploadWechatFile
		},
		data() {
			return {
				current_tab: "image",
				image: [],
				voice: [],
				video: [],
				file: [],
				multiple: true,
				pageSize: 24,
				taskLength: 0
			}
		},
		watch: {
			'$store.state.upload.upload_task': function (val) {
				if(val && val.length > this.taskLength){					
					this.setTabAndRefresh(val[val.length - 1])					
				}				
				this.taskLength = val.length
			}
		},
		methods: {
			init_data () {
				this.$refs[this.current_tab].resetSearch()
				this.clearSelect()
			},
			refreshData (response) {
				this.setTabAndRefresh(response.data)
			},
			clearSelect () {
				this.image.splice(0,this.image.length)
				this.voice = []
				this.video = []
				this.file = []
			},
			setTabAndRefresh (data) {
				if(data&&data.media_type){
					this.current_tab = data.media_type
				}
				setTimeout(()=>{
					this.$refs[this.current_tab].resetSearch()					
				},100)
			},
			uploadByLocal () {
				if(this.hasUploadingFile){
					this.$Message.error('当前有文件正在上传，请上传完成后再上传新文件!')
					return
				}
				
				this.xupload.handleClick()
			},
			uploadByWechat () {
				this.$r('uploadWechat')
				.show('通过微信上传文件')
			},	
			delFiles () {
				let tip = util.sprintf('确认删除所选【%s】个文件吗？',this.total)
				this.confirm(tip)
				.then(()=>{
					this.$rest('files/delete_files').post({file_ids:this.selected})
			  		.success(response=>{
			  			this.dealDelResult(response.data)				  			
			  		}).error(response=>{
			  			this.error(response.body.message||'删除失败','warn')
			  		})
				})
			},
			pushFiles () {				
				this.$Modal.open('filepackage/push-modal.vue')
				.then(modal=>{
					modal.set('fileIds',this.selected)
					.show('推送文件','add')
				})
			},
			get_history() {
				this.$Modal.open('common/modal/push-history.vue@modal')
				.then(modal => {
					modal.show('推送历史')
				})
			}
		},
		computed: {
			hasUploadingFile () {
				return !_.isEmpty(this.uploadingFile) && this.uploadingFile.name
			},
			uploadingFile () {
				return this.$store.state.upload.uploading_file||{}
			},
			labelText() {
				if(this.image[0]&&!this.multiple) {
					return this.$store.getters.getMapObject(this.image[0],resName).file_name
				}else{
					return ''
				}
			},
			selected () {
				let result = []
				result = result.concat(this.image,this.voice,this.video,this.file)
				return result
			},
			total () {
				return this.selected.length
			},
			chooseContent () {
				let result = ''
				if(this.image.length>0){
					result += `<p>图片: ${this.image.length}</p>`
				}
				if(this.voice.length>0){
					result += `<p>语音: ${this.voice.length}</p>`
				}
				if(this.video.length>0){
					result += `<p>视频: ${this.video.length}</p>`
				}
				if(this.file.length>0){
					result += `<p>文件: ${this.file.length}</p>`
				}
				
				return result
			}
		}		
	}
</script>

<style>
</style>