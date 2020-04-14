<style lang="less">
	.file-item {
		margin-bottom: 10px;
		.title {
			text-align: center;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.video-play {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translateX(-50%) translateY(-50%);
		}
	}
</style>
<template>
	<div class="file-item">
		<div class="review-upload-list">
			<play-voice class="voice-s" v-if="isVoice(item.file_type)" :src="item.file_url"></play-voice>
			<a :class="{['video']:isVideo(item.file_type)}" :href="item.file_url" target="_blank" :title="item.file_name" v-else style="position: relative;">
				<img :src="item.file_url+'?imageView2/3/w/63/h/63'" v-if="isImage(item.file_type)">
				<template v-if="isVideo(item.file_type)" >
					<img :src="item.file_url+'?vframe/jpg/offset/1/w/160/h/160'">
					<span class="video-play">
						<Icon type="play" size="35"></Icon>
					</span>
				</template>
				<img :src="replaceFileImage(item)" v-if="item.media_type=='file'">
			</a>
		</div>
		<p class="title">{{item.file_name}}</p>
	</div>
</template>
<script>
	import common from '@/libs/common.mixin'
	import PlayVoice from 'c%/playVoice.vue'
	export default {
		mixins: [common],
		components: {
			PlayVoice
		},
		props: {
			item: {
				type: Object,
				default:()=>{
					return {}
				}
			}
		},
		data() {
			return {

			}
		},
		methods: {
			isVoice (type) {
				let voice_type = 'voice,amr,mp3,wav'
				return voice_type.indexOf(type)>-1
			},
			isVideo (type) {
				let voice_type = 'video,rm,rmvb,mpeg1－4,mov,mtv,dat,wmv,avi,3gp,amv,dmv,flv,mp4'
				return voice_type.indexOf(type)>-1
			},
			isImage (type) {
				let img_type = 'image,jpg,jpeg,png,gif,bmp'
				
				return img_type.indexOf(type)>-1
			},
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
		}
	}
</script>