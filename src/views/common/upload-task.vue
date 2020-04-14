<template>
	<div class="navbar-task ml-3" v-if="tasks.length>0">
		<Poptip trigger="hover" placement="bottom" width="250" v-if="(tasks && tasks.length ) || (currentUploadList && currentUploadList.length)">
			<Badge dot :title="'有'+tasks.length+'条上传记录'">				
	        	<img :src="uploadIcon" style="vertical-align: initial;">        		
	   		</Badge>
	   		<div class="upload-container" slot="content"  v-if="(tasks && tasks.length ) || (currentUploadList && currentUploadList.length)">
	   			<template v-for="(item,index) in currentUploadList" >
		   			<div class="x-upload-item" v-if="item.status!='finished'">
		   				<div class="item-top">
		        			<span class="item-name">{{item.name}}</span>
		        			<div class="item-operate">
		        				<Icon class="mr-2 cursor" :type="item.status=='uploading'?'ios-pause':'ios-play'" size="18" @click="toggleUpload(item)"></Icon>
		        				<Icon class="cursor" type="android-close" size="18" @click="delUploadingFile(item)"></Icon>
		        			</div>	        			 
		        		</div>
		        		<div class="item-footer">
		        			<span class="item-size">	        				
		        				{{getFileSize(item.loaded)}}/{{getFileSize(item.size)}}
		        			</span>
		        			<span class="pull-right text-info">{{parseInt(item.percentage)}} %</span>
		        		</div>
		        		<i-progress :percent="item.percentage" :stroke-width="5" hide-info></i-progress>
		   			</div>
	   			</template>
	        	<div class="x-upload-item" v-for="item in tasks" :key="item.file_id">
	        		<div class="item-top">
	        			<span class="item-name" :title="item.name">{{item.name}}</span>
	        			<div class="item-operate">
	        				<Icon class="text-success" type="checkmark" size="14"></Icon>
	        			</div>
	        		</div>
	        		<div class="item-footer">
	        			<span class="item-size">
	        				{{getFileSize(item.size)}}	        				
	        			</span>
	        		</div>
	        	</div>
	        </div>
		</Poptip>		
		<Icon class="nav-icon" size="22" type="arrow-up-a" title="暂无文件上传任务" v-else></Icon> 			
		
		<span class="text-info" v-if="isUploading">{{uploadPercent}}%</span>
	</div>
</template>

<script>
	import util,{_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	
	export default{
		mixins: [ common ],
		computed: {
			uploadIcon () {
				let img = 'http://sp1.xiao360.com/static/ui/pc/uploadstart.png'
				if(this.isUploading){
					img = 'http://sp1.xiao360.com/static/ui/pc/uploading.gif'
				}
				return img
			},
			isUploading () {
				return !_.isEmpty(this.uploadingFile) && this.uploadingFile.start
			},
			hasUploadTask () {
				return this.tasks.length > 0 || !_.isEmpty(this.uploadingFile) && this.uploadingFile.name
			},
			uploadingFile () {
				return this.$store.state.upload.uploading_file||{}
			},
			uploadPercent () {
				let percent = 0
				if(!_.isEmpty(this.$store.state.upload.uploading_file)){
					percent = parseInt(this.$store.state.upload.uploading_file.percentage) 
				}				
				return percent 
			},
			tasks () {
				return this.$store.state.upload.upload_task
			},
			currentUploadList () {
				return this.$store.state.layout.currentFileList
			}
		},
		methods: {
			delUploadingFile (item) {
				let index = this.currentUploadList.findIndex(f=>f.uid==item.uid)
				if(index > -1){
					this.currentUploadList.splice(index, 1)
					this.xupload.qiniuHandlePause(item)
				}
			},
			toggleUpload (item) {
				if(item.status=='uploading'){
					item.status = 'pause'
					this.xupload.qiniuHandlePause(item)
				}else{
					item.status = 'uploading'
					this.xupload.qiniuHandleStart(item)
				}
			},
			delFile (item) {
				let list = util.copy(this.tasks),
					index = list.findIndex(l=>l.file_id == item.file_id)
				
				if(index > -1){
					list.splice(index,1)
					
					this.$store.commit('updateUploadTask',list)
				}				
			},
			getFileSize (size) {
				let result = 0,
					unit = 'B'
				
				if(size / 1024 > 1024){
					result = size / (1024*1024)
					unit = 'M'
					
					if(result > 1024){
						result = size / (1024 * 1024 * 1024)
						unit = 'G'
					}
					
				}else{
					result = size / 1024
					unit = 'KB'
				}
				
				result = parseFloat(result).toFixed(2)
				
				return `${result}${unit}`
			}
		}
		
	}
	
</script>

<style lang="less" scoped>
.upload-container{
	overflow: hidden;
	padding: 0;
}
.x-upload-item{
	border-bottom: 1px solid #ccc;
	padding: 10px 0;	
	
	&:nth-last-child(1){
		border: none;
	}
	
	.item-top{
		display: flex;
		flex-direction: row;
		.item-name{
			flex: 1;
			font-size: 14px;
		    overflow: hidden;
		    white-space: nowrap;
		    text-overflow: ellipsis;
		}	
		.item-operate{
			width: 60px;
			text-align: right;
		}
	}
	.item-footer{
		.item-size{
			font-size: 12px;
			color: #999999;
		}
	}
	
}
</style>