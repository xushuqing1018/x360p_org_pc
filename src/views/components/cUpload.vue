<template>
	<div class="c-upload">
		<div class="c-upload-list" v-if="showList">
			<!-- todo:显示图片列表 -->
		</div>
		<div class="c-upload-btn">
			<Dropdown v-if="multiUploadWay">
				<Button 
				:icon="btnIcon" 
				:type="btnType" 
				:size="btnSize"
				:loading="show_progress"
				>
					{{btnText}}
					<Icon type="arrow-down-b"></Icon>
				</Button>
				<DropdownMenu slot="list">
					<DropdownItem v-if="hasWay0">
						<x-upload 
							ref="handupload"
							:multiple="multiSelect"
							:format="format"
							:show-upload-list="false"
							:headers="upload_header"						
							:on-format-error="handleFormatError"
							:before-upload="handleUploadBefore"
							:on-progress="handleProgress"
							:data="uploadPost"     
							:on-success="handleSuccess"
							>					
							<span>本机上传</span>
						</x-upload> 
					</DropdownItem>
					<DropdownItem @click.native="selectFromMyFile" v-if="hasWay1">
						<span>我的文件框</span>
					</DropdownItem>
					<DropdownItem @click.native="selectCourseFile" v-if="hasWay2">
						<span>从课标选择</span>
					</DropdownItem>	
					<DropdownItem @click.native="inputUrl" v-if="hasWay3">
						<span>输入网络地址</span>
					</DropdownItem>	
				</DropdownMenu>
			</Dropdown>
			<template v-else>
				<x-upload 
					v-if="isWay0"
					ref="handupload"
					:multiple="multiSelect"
					:format="format"
					:show-upload-list="false"
					:headers="upload_header"						
					:on-format-error="handleFormatError"
					:on-progress="handleProgress"
					:data="upload_post"     
					:on-success="handleSuccess"
					>					
					<Button
						:icon="btnIcon" 
						:type="btnType" 
						:size="btnSize"
						:loading="show_progress"
						>
						{{btnText}}
					</Button>
				</x-upload> 
				<Button
				v-if="isWay1"
				:icon="btnIcon" 
				:type="btnType" 
				:size="btnSize"
				@click="selectFromMyFile"
				>
					{{btnText}}
				</Button>
				<Button
				v-if="isWay2"
				:icon="btnIcon" 
				:type="btnType" 
				:size="btnSize"
				@click="selectCourseFile"
				>
					{{btnText}}
				</Button>
				<Button
				v-if="isWay3"
				:icon="btnIcon" 
				:type="btnType" 
				:size="btnSize"
				@click="inputUrl"
				>
					{{btnText}}
				</Button>
			</template>
			<div class="c-upload-progress" v-if="show_progress">
				<Progress 
				:percent="upload_percent" 
				status="active"
				:stroke-width="12" 
				>
				</Progress>
			</div>
		</div>
		<Modal
			v-model="input_modal"
			title="请输入"
			@on-ok="setInputValue"
			@on-cancel="hideInputModal">
			<i-input type="textarea" v-model="input_value" placeholder="请输入文件网址..."></i-input>
		</Modal>
	</div>
</template>

<script>
	import common from '@/libs/common.mixin'
	import {_} from '@/libs/util'
	import playVoice from 'c%/playVoice.vue'
	import XUpload from 'c%/xupload/index'

	
	export default{
		mixins: [common],
		components:{
			XUpload,
			playVoice
		},
		props: {
			value: {
				type: [String, Array],
				default(){
					return ''
				}
			},
			showList:{
				type: Boolean,
				default: false
			},
			readOnly:{
				type: Boolean,
				default: false
			},
			btnIcon:{
				type: String,
				default: 'upload'
			},
			btnText:{
				type: String,
				default: '上传文件'
			},
			btnSize:{
				type: String,
				default: 'small'
			},
			btnType:{
				type: String,
				default: 'default'
			},
			uploadWay:{
				type: Array,
				default(){
					return [0,1,2,3]			//0本地1我的文件2课标3网络图片
				}
			},
			mode: {
				type: String,
				default: 'add'
			},
			selType: {
				type: String,
				default: 'image'
			},
			multiSelect:{
				type: Boolean,
				default: false
			},
			uploadPost:{
				type: Object,
				default(){
					return {
                    	mod:'correct_upload'
					}
				}
			},
			isComma:{
				type: Boolean,
				default: false
			},
			isArrayString:{
				type: Boolean,
				default: false
			}
		},
		data () {
			return {
				uploadList:[],
				loading: false,
				upload_percent:0,
				show_progress:false,
				active_voice: -1,
				input_modal:false,
				input_value:''
			}
		},
		mounted () {
			
		},
		methods: {
			replaceDefaultImage(item) {
				const suffixs = ['txt','doc','pdf','rar','zip','xls','ppt']
				let type = item.file_type
				if(type === 'pptx') {
					type = 'ppt'
				}
				if(type === 'docx') {
					type ='doc'
				}
				if(type === 'xlsx') {
					type = 'xls'
				}
				if(suffixs.indexOf(type) > -1) {
					return `http://sp1.xiao360.com/static/file/icon/${type}.png?imageView2/3/w/100/h/100`
				}else{
					return `http://sp1.xiao360.com/static/file/icon/default.png?imageView2/3/w/100/h/100`
				}
			},
			selectCourseFile () {
				this.$Modal.open('components/SelectCourseStandardFile.vue@modal',{
					on: {
						'on-selected': (list)=>{
							this.addCourseFile(list)
						}
					}
				}).then(modal=>{
					modal.show('选择课标文件','add')
				})
			},
			addCourseFile (list) {
				list.forEach(l=>{
					this.uploadList.push(l)					
				})
				this.uploadList = [...new Set(this.uploadList)]
				this.emitSuccessEvent()
			},
			previewVideo(item) {
				this.$Modal.open('components/VideoPreview.vue@modal')
				.then(modal => {
					modal
					.set('video',item)
					.show('播放视频')
				})
			},
			selectFromMyFile() {
	        	this.$Modal.open('components/SelectFile.vue@modal',{
					props: {
						selType: this.selType,
						multiple: this.multiFile
					},
					on: {
						'selected':(data)=>{
							this.selectFile(data)
						}
					}
				})
				.then(modal => {
					modal.vuec.show('我的文件框','list')
				})
	        },
	        selectFile(data) {
				
				if(_.isArray(data)){
					data.forEach(item => {
						this.uploadList.push({
							file_id: item.file_id,
							file_url: item.file_url,
							file_type: item.file_type,
							media_type: item.media_type
						})
					})
				}else{
					this.uploadList.push(data)
				}
	        	this.emitSuccessEvent()
			},
			inputUrl(){
				this.showInputModal()
			},
			setInputValue(){
				this.$emit('input',this.input_value)
				this.input_value = ''
			},
			showInputModal(){
				if(_.isString(this.value) && !this.isComma){
					this.input_value = this.value
				}else{
					this.input_value = ''
				}
				this.input_modal = true	
			},
			hideInputModal(){
				this.input_modal = false
			},
			handleRemove (file) {
            	// 从 upload 实例删除数据
	            const fileList = this.uploadList;
	            this.uploadList.splice(fileList.indexOf(file), 1)
	            this.$emit('on-change',this.uploadList)
			},
			handleUploadBefore(file){
				this.show_progress = true
				this.upload_percent = 0
				this.$emit('on-upload-start',file)
			},
	        handleProgress (event, file, fileList) {
				this.upload_percent = event.percent
				if(this.upload_percent >= 100){
					this.show_progress = false
				}
	        	this.$emit('on-uploading',{
					event,
					file,
					fileList
				})
	        },
	        handleSuccess (res, file) {	        	
	        	file.url = res.data.file_url	
	            // 上传成功   添加到list
	            this.uploadList.push({
	            	file_id: res.data.file_id,
	        		file_url: res.data.file_url,
	        		file_type: res.data.file_type,
	        		media_type: res.data.media_type
				})
				this.emitSuccessEvent()
	        },
	        handleFormatError (file) {
	        	let file_list = this.format.join(',')
	            this.$Notice.warning({
	                title:'文件格式不正确',
	                desc:'文件 ' + file.name + ' 格式不正确，请上传 '+file_list+' 格式的文件。'
	            });            
	        },
	        handleMaxSize (file) { 
	            this.$Notice.warning({
	                title: '超出文件大小限制',
	                desc: '文件 ' + file.name + ' 太大，不能超过 2M。'
	            });
	        },
	        handleBeforeUpload (postFiles,file) {
	            const check = this.uploadList.length < 10;
	            if (!check) {
	                this.$Notice.warning({
	                	title: '上传错误',
	                	desc:'最多只能上传 9  张图片。'
	                });
	            }
	            return check;
	        },
	        isVoice (type) {
				let voice_type = 'voice,amr,mp3,wav'
				return voice_type.indexOf(type)>-1
			},
			isVideo (type) {
				let voice_type = 'video,rm,rmvb,mpeg1－4,mov,mtv,dat,wmv,avi,3gp,amv,dmv,flv,mp4'
				return voice_type.indexOf(type)>-1
			},
			isImage (type) {
				let img_type = 'IMAGE,JPG,PNG,JPEG,GIF,image,jpg,jpeg,png,gif,bmp'
				
				return img_type.indexOf(type)>-1
			},
	        file_list (type) {
            	let [result,uploadList] = [[],this.uploadList]
            	if(uploadList.length > 0){
            		let filter = (item)=>{
            			if(typeof item.media_type == 'string'){
            				return item.media_type == type
            			}else{
            				type = this.getFileTypes(type)
            				
            				return type.indexOf(item.file_type)>-1
            			}
            		}
            		
            		result = uploadList.filter(filter)
            	}
            	return result 
            },
            getFileTypes (type) {
           		if(type=='image'){
            		type = ['image','gif','jpg','jpeg','png','bmp','webp']
            	}else if(type=='voice'){
            		type = ['voice','mp3','wav','wma','ogg','aac','flac']
            	}else if(type=='video'){
            		type = ['video','mp4','m3u8','rmvb','avi','swf','3gp','mkv','flv']
            	}else{
            		type = ['numbers','csv','xls','xlsx','keynote','ppt','pptx']
            	}
            	return type
			},
			emitSuccessEvent(){
				this.show_progress = false
				if(this.multiFile){
					this.$emit('input',this.uploadList)
				}else{
					let max = this.uploadList.length -1
					this.$emit('input',this.uploadList[max].file_url)
				}
	            this.$emit('on-change',this.uploadList)
			}
		},
		computed: {
			multiUploadWay() {
				return this.uploadWay.length > 1
			},
			isWay0(){
				return this.uploadWay.length == 1 && this.uploadWay[0] == 0
			},
			isWay1(){
				return this.uploadWay.length == 1 && this.uploadWay[0] == 1
			},
			isWay2() {
				return this.uploadWay.length == 1 && this.uploadWay[0] == 2
			},
			isWay3() {
				return this.uploadWay.length == 1 && this.uploadWay[0] == 3
			},
			hasWay0(){
				return this.uploadWay.indexOf(0) !== -1
			},
			hasWay1(){
				return this.uploadWay.indexOf(1) !== -1
			},
			hasWay2(){
				return this.uploadWay.indexOf(2) !== -1
			},
			hasWay3(){
				return this.uploadWay.indexOf(3) !== -1 && !this.multiFile && !this.isComma
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
			multiFile(){
				return _.isArray(this.value)
			},
			upload_header () {
                return {
                    'x-token':this.$store.state.user.token,
                    'x-file-key':'file'
                }
			},
			isUploading(){
				return this.upload_percent > 0 && this.upload_percent < 100
			}
		}
	}
</script>