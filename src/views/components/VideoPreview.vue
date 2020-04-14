<template>
	<Modal :title="modal$.title" v-drag-modal v-model="modal$.show" :mask-closable="false" width="600">
    	<vue-video 
    	class="custom-video" 
    	v-if="modal$.show" 
    	:sources="sources" 
    	:options="getVOptions(sources[0])" 
    	style="height:400px">
    	</vue-video>
    	<div slot="footer">
    		<Button type="ghost" @click="close">关闭</Button>
    	</div>
    </Modal>
</template>

<script>
	import {_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import VueVideo from 'c%/vueVideo.vue'
	
	export default{
		mixins: [ modal ],
		components: {
			VueVideo
		},
		data () {
			return {
				video: {
					file_url: 'http://125.39.7.18/vweixinp.tc.qq.com/1007_a8e5faf4b42b4e6f8246570f5c43f482.f10.mp4?vkey=0B62697DBA6B65E78A0FA819D33A6022A47F0DE7D71C11F9583492EAA12099E2C08E3D36036C672A2EF3338F1A2FF2F86B7A0233386BABB1207C49B145C90163AC09E3CAD833C4360F0F4C5094E029162BD019D3DC6EA319&sha=0&save=1',//'http://omyc1h52u.bkt.clouddn.com/7205e7cd26829b83f49499dea2ad519b.mp4',
					file_size: 1371058,
				}
			}
		},
		methods: {
			getVOptions (item) {
				return {
					autoplay: false,
			        volume: 0.6,
			        poster: item.src+'?vframe/jpg/offset/1/w/300/h/200'				
				}
			}
		},
		computed: {
			sources () {
				let video = this.video,
					result = []
				if(!_.isEmpty(video)){
					result = [{
						src: video.file_url,
						size: video.file_size,
						type: 'video/mp4'
					}]
				}
				return result
			}
		}
	}
	
</script>

<style>
</style>