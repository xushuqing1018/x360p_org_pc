<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<div class="lesson-up">
			<Icon type="arrow-right-a" size="30"></Icon>
			<select-lesson 
				v-model="lid"
				placeholder="请选择升级到哪个课程" 
				style="width: 250px;"
				@selected="selectlesson"
				>
			</select-lesson>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectLesson from 'c%/SelectLesson'
	export default {
		mixins: [modal,common],
		components: {
			SelectLesson
		},
		props: {
			data: Object
		},
		data() {
			return {
				lid: 0,
				toLesson: null 
			}
		},
		methods: {
			selectlesson(selected) {
				this.toLesson = selected
			},
			ok() {
				if(this.lid == 0) {
					this.$Message.error('请选择升级到哪个课程')
					return
				}
				if(this.lid == this.data.lid) {
					this.$Message.error('请选择不同的课程')
					this.lid = 0
					return
				}
				this.$emit('on-ok',{from: this.data,to: this.toLesson})
				this.close()
			}
		}
	}
</script>
<style>
	.lesson-up .ivu-icon-arrow-right-a {
		margin-left: 25px;
		margin-right: 25px;
		vertical-align: middle;
	}
</style>