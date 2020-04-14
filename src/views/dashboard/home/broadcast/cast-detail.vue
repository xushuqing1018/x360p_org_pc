<template>
	<Modal v-drag-modal :mask-closable="false" width="800" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<template v-if="modal$.show">
			<h3 class="text-center mb-2">{{info.title}}</h3>
			<p class="text-center">
				<span class="mr-2">{{info.user.name}}</span>
				<span>{{info.create_time}}</span>
			</p>
			<div class="content" v-html="info.desc"></div>
        </template>
    	<div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
        </div>
    </Modal>
</template>
<script>
 	import modal from '@/libs/modal.mixin'

	export default {
		mixins: [modal],
		data() {
			return {
				info: {}
			}
		}
	}
</script>
<style lang="less" scoped>
	.content {
		margin: 20px;
		height: 300px;
		overflow: auto;
	}
</style>