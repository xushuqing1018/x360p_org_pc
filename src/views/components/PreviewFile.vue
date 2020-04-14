<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="375" :mask-closable="false">		
		<div>
			<div class="pd-10" v-if="file_list('voice').length>0">
				<div class="pd-10">
					<div :class="index>0?'ml-3':''" v-for="(item,index) in file_list('voice')" align="center" :key="index">
						<div class="voice-item">
							<play-voice :src="item.file_url" :active="index===active_voice" @click.native="active_voice = index"></play-voice>								
						</div>
					</div>				
				</div>
			</div>
			<div class="text-center" v-if="file_list('image').length>0">
				<div class="review-upload-list" v-for="(item,index) in file_list('image')">
					<a :href="item.file_url" target="_blank"><img :src="item.file_url"/></a>
				</div>
			</div>
			<div class="text-center" v-if="file_list('video').length>0">			
			    <div class="review-upload-list" v-for="(item,index) in file_list('video')" align="center" :key="index">
					<div class="video-item" @click="previewVideo(item)">
			            <img :src="item.file_url+'?vframe/jpg/offset/1/w/130/h/130'">
			            <span class="video-play"><i class="ivu-icon ivu-icon-play" style="font-size:25px"></i></span>
				    </div>
				</div>			
			</div>
			<div class="pd-10" v-if="file_list('file').length>0">
				<div :class="index>0?'ml-3':''" v-for="(item,index) in file_list('file')" align="center" :key="index">
					<div class="review-upload-list">
						<a :href="item.file_url" :title="item.file_name">
				            <img :src="replaceFileImage(item)">
					    </a>
				    </div>
				</div>					
			</div>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import VueVideo from 'c%/vueVideo.vue'
	import PlayVoice from 'c%/playVoice.vue'
	
	export default{
		mixins: [ common,modal ],
		components: {
			VueVideo,
			PlayVoice
		},
		props: {
			list: {
				type: Array,
				default: ()=>{
					return []
				}
			}
		},
		data () {
			return {
				active_voice: -1,
			}
		},
		methods: {
			sources (item) {
				let result = [{
						src: item.file_url,
						size: item.file_size,
						type: 'video/mp4'
					}]
				
				return result
			},
			getVOptions (item) {
				return {
					autoplay: false,
			        volume: 0.6,
			        poster: item.src+'?vframe/jpg/offset/1/w/300/h/200'				
				}
			},
			file_list (type) {
            	let [result,list] = [[],this.list]
            	if(list.length > 0){
            		let filter = (item)=>{
            			if(typeof item.media_type == 'string'){
            				return item.media_type == type
            			}else{
            				type = this.getFileTypes(type)
            				
            				return type.indexOf(item.file_type)>-1
            			}
            		}            		
            		result = list.filter(filter)
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
           	previewVideo(item) {
				this.$Modal.open('components/VideoPreview.vue@modal')
				.then(modal => {
					modal
					.set('video',item)
					.show('播放视频')
				})
				
			}
		}
	}
	
</script>
