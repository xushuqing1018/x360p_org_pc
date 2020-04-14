<template>
	<div class="guide-modal" v-transfer-dom v-if="show_flag" width="500">
		<div class="ivu-modal-mask" style="z-index:2060;"></div>
		<div class="ivu-modal-wrap" style="z-index:2061;">
			<div class="btn-wrap">
				<img class="skip-img mr-3" src="../../../img/skip.png" @click="skip"/>
				<img class="ok-img "src="../../../img/ok.png" @click="ok"/>
			</div>
		</div>
	</div>
</template>
<script>
	import Vue from 'vue'
	export default {
		data() {
			return {
				show_flag: false
			}
		},
		methods: {
			ok () {
				this.show_flag = false
				Vue.localStorage.set('guide_visited', 1)
				this.$store.state.layout.startGuide()
			},
			show () {
				this.show_flag = true
			},
			skip () {
				this.show_flag = false
				Vue.localStorage.set('guide_visited', 1)
				this.$store.state.layout.isSetup()
			}
		}
	}
</script>
<style lang="less">
	.guide-modal {
		.btn-wrap {
			position: absolute;
			width: 450px;
			top: 60%;
			left: 50%;
			transform: translateX(-70%);
			img {
				cursor: pointer;
			}
		}
		.ivu-modal-wrap {
			background-image: url("../../../img/guide.png");
	        background-repeat: no-repeat;
	        background-position: center center;
		}
	}
</style>