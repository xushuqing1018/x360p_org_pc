<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<review-upload v-model="images" :showCourseFile="false">
			<span>开场留影</span>
		</review-upload>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import ReviewUpload from 'c%/ReviewUpload.vue'

	export default {
		mixins: [modal,common],
		components: {
			ReviewUpload
		},
		props: {
			arrange: Object
		},
		data() {
			return {
				images: []
			}
		},
		methods: {
			onModalOpen() {
				this.getCourseArrangeImage()
			},
			getCourseArrangeImage() {
				this.$rest('course_arrange_images')
				.get({
					ca_id: this.arrange.ca_id
				})
				.success(res => {
					this.images = res.list
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			ok() {
				if(this.images.length==0) {
					this.$Message.error('请上传开场留影')
					return
				}
				this.$rest('course_arrange_images')
				.post({
					ca_id: this.arrange.ca_id,
					images: this.images
				})
				.success(res => {
					this.$Message.success('上传成功')
					this.$emit('on-success')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>