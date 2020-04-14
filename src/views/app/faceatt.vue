<template>
	<div class="faceatt">
		<div class="faceatt-wrapper">
			<div class="faceatt-center">
				<img src="http://sp1.xiao360.com/static/ui/pc/faceatt.gif" width="250"/>
				<div class="btns">
					<Button class="faceatt-list" type="primary" @click="faceatt">刷脸考勤记录</Button>
					<Button class="faceatt-config" type="primary" @click="faceConfig">人脸识别配置</Button>
					<Button class="faceatt-manage" type="primary" @click="facesk">人脸识别管理</Button>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	export default {
		data() {
			return {

			}
		},
		methods: {
			faceatt() {
				this.$router.push({path:'./faceattl'})
			},
			facesk() {
				window.open('https://skfrm.sk-ai.com/#/login')
			},
			faceConfig() {
				this.$Modal.open('app/faceatt/face-config.vue@modal')
				.then(modal => {
					modal.show('人脸识别配置')
				})
			}
		}
	}
</script>
<style lang="less">
	.faceatt {
		width: calc(~"100% - 200px");
		height: calc(~"100% - 173px");
		position: absolute;
		top: 123px;
		left: 200px;
		overflow: hidden;
		background-image: url('http://sp1.xiao360.com/static/ui/pc/faceatt.png');
		background-repeat: no-repeat;
		background-size: 100% 100%;

		&-wrapper {
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		&-center {
			width: 600px;
			height: 400px;
			text-align: center;
			.btns {
				margin-top: 3rem;
			}
		}

		.faceatt-list {
			margin-right: 3rem;
		}
		.faceatt-manage {
			margin-left: 3rem;
		}
	}
</style>