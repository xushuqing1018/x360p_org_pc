<style lang="less">
	.voice{
		background-image: url(../../img/voice.png);
		background-position: 0 144px;
		width: 80px !important;
		height: 80px !important;
		max-width: 100%;
		max-height: 100%;
		margin: 0 auto;
		&.active{
			background-image: url(../../img/play-voice.gif);
		    background-position: center;
		    background-size: 100%;
		}
	}
	.voice-s{
		background-position: 0 62px;
	}
</style>

<template>
	<div class="voice" :class="isPlaying?'active':''" @click="togglePlay">
		<audio 
			   style="display: none;"
		       controls="controls"
		       preload="auto"
		       @ended="ended"
		       :src="src"
		       ref="player">
		</audio>
	</div>
</template>

<script>
	export default{
		props: {
			src: {
				type: String,
				default: ''
			},
			active: {
				type: Boolean,
				default: false
			}	//控制播放、暂停
		},
		data () {
			return {
				isPlaying: false,
			}
		},
		watch: {
			active: function (val) {
				if(val){
					this.play()
				}else{
					this.ended()
				}				
			}
		},
		methods: {
			togglePlay () {
				this.isPlaying = !this.isPlaying
				if(this.isPlaying){
					this.play()
				}else{
					this.stop()
				}
				this.$emit('click')
			},
			play () {
				this.isPlaying = true
	            this.$refs.player.play()
		    },
		    stop () {
	            this.$refs.player.pause()
		    },
		    ended () {
		    	this.$refs.player.currentTime = 0
		    	this.isPlaying = false
		    	this.$refs.player.pause()
		    },
		}
	}
</script>

