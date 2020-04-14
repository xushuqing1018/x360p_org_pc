<template>
	<div>
		<div class="p-3" v-if="file_list('voice').length>0">
			<div class="pd-10 file-list-container">
				<div class="mr-3" v-for="(item,index) in file_list('voice')" align="center" :key="index">
					<div class="review-upload-list">
						<play-voice class="voice-s" :src="item.file_url" :active="index===active_voice" @click.native="active_voice = index">
							<span class="image-close" @click.stop="delFile(item)" v-if="clearable">X</span>
						</play-voice>
					</div>
				</div>				
			</div>
		</div>
		<div class="p-3" v-if="file_list('audio').length>0">
			<div class="pd-10 file-list-container">
				<div class="mr-3" v-for="(item,index) in file_list('audio')" align="center" :key="index">
					<div class="review-upload-list">
						<play-voice class="voice-s" :src="item.file_url" :active="index===active_voice" @click.native="active_voice = index">
							<span class="image-close" @click.stop="delFile(item)" v-if="clearable">X</span>
						</play-voice>
					</div>
				</div>				
			</div>
		</div>
		<div class="p-3" v-if="file_list('image').length>0">
			<div class="pd-10 file-list-container">
				<div class="mr-3" v-for="(item,index) in file_list('image')" align="center" :key="index">
					<div class="review-upload-list" @click="picturePreview(item.file_url)">					      
			            <img :src="item.file_url">
			            <span class="image-close" @click.stop="delFile(item)" v-if="clearable">X</span>
				    </div>
				</div>					
			</div>
		</div>
		<div class="p-3" v-if="file_list('video').length>0">
			<div class="pd-10 file-list-container">
				<div class="mr-3" v-for="(item,index) in file_list('video')" align="center" :key="index">
					<div class="video video-item" @click="previewVideo(item)">
			            <img :src="item.file_url|video_cover_url_filter">
			            <span class="video-play ivu-icon ivu-icon-play" style="font-size:25px"></span>
			            <span class="image-close" @click.stop="delFile(item)" v-if="clearable">X</span>
				    </div>
				</div>					
			</div>
		</div>
		<div class="p-3" v-if="file_list('file').length>0">
			<div class="pd-10 file-list-container">
				<div class="mr-3" v-for="(item,index) in file_list('file')" align="center" :key="index">
					<div class="review-upload-list">
						<a :href="item.file_url" :title="item.file_name">
				            <img :src="replaceFileImage(item)">			            
				            <span class="image-close" @click.stop="delFile(item)" v-if="clearable">X</span>
					    </a>
				    </div>
				</div>					
			</div>
		</div>
        <video-preview ref="videoPreview"></video-preview>
	</div>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import PlayVoice from 'c%/playVoice.vue'	
	import VueVideo from 'c%/vueVideo.vue'
	import VideoPreview from 'c%/VideoPreview.vue'
	
	export default{
		mixins: [ common, modal ],
		components: {
			PlayVoice,
			VueVideo,
			VideoPreview
		},
		props: {
			list: {
				type: Array,
				default: ()=>{
					return []
				}
			},
			clearable: {
				type: Boolean,
				default: false
			}
		},
		filters:{
			video_cover_url_filter(val){
				if(val.indexOf('xiao360.com') !== -1){
					val = val + '?vframe/jpg/offset/1/w/160/h/160'
				}else if(val.indexOf('oss') !== -1){
					val = val +'?x-oss-process=video/snapshot,t_1000,f_jpg,w_160,h_160,m_fast'
				}else{
					val = 'http://sp1.xiao360.com/static/img/blackbg.jpg'
				}
				return val
			}
		},
		data () {
			return {
				active_voice: -1
			}
		},
		methods: {			
			file_list (type) {
            	let [result,uploadList] = [[],this.list]
            	if(uploadList.length>0){
            		//console.log('type:'+type)
            		result = uploadList.filter(u=>u.media_type==type)
            		//console.log(result)
            	}
            	return result 
			},
			previewVideo(item) {
				this.$refs.videoPreview
				.set('video',item)
				.show('播放视频')				
			},
			delFile (item) {
				let index = this.list.indexOf(item)
				if(index > -1){
					this.list.splice(index,1)
				}
			}
		}
	}
</script>

<style lang="less" scoped>
	.file-list-container{
		div{
			display: inline-block;
		}
	}
</style>