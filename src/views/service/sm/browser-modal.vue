<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="450" @on-cancel="cancel" class="mobile">
		<div class="phone" v-if="url != ''">
			<iframe :src="url" class="iframe"></iframe>
		</div>
		<div slot="footer">
			<Icon type="arrow-left-c" size="30" class="back-btn" @click="backHistory"></Icon>
			<Button type="ghost" @click="cancel">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'	
	import common from '@/libs/common.mixin'
	export default{
		mixins: [modal,common],
		data () {
			return {
				url: ''
			}
		},
		methods: {
			backHistory() {
				window.history.back();
			},
			cancel () {
				this.url = ''
				this.close()
			}
		}
	}
	
</script>

<style scoped>

.phone {
	width: 428px;
	height: 762px;
	background-image: url('http://sp1.xiao360.com/static/img/phone.png');
	background-repeat: none;
	background-size: cover;
	position: relative;
}

.iframe {
	width: 375px;
	height: 667px;
	border: none;
	position: absolute;
	top: 70px;
	left: 28px;
	border-top-left-radius: 0px 0px;
	border-top-right-radius: 0px 0px;
	border-bottom-right-radius: 40px 40px;
	border-bottom-left-radius: 40px 40px;
}

.back-btn {
	cursor: pointer;
	position: relative;
	top: 5px;
	right: 310px;
}
</style>