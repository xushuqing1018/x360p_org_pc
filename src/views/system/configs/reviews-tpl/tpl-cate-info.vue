<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="400">
		<Form ref="form" :modal="info" :label-width="80">
			<Form-item label="分类名称" prop="name">
				<Input v-model="info.name" placeholder="请输入分类名称"></Input>
			</Form-item>						
		</Form>
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
	import globals from '@/libs/globals.mixin'

	const INFO_NAME = '分类'
	const INFO_PK_ID = 'rtc_id'
	const INFO_URL   = 'review_tpl_cates'

	const emptyObj = {
		name: ''
	}
	export default {
		mixins: [modal,common,globals],
		data() {
			return {
				info: util.copy(emptyObj)
			}
		},
		computed: {
			info_url$(){
            	return INFO_URL
	        },
	        info_name$(){
	            return INFO_NAME
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
	        }
		},
		methods: {
			ok() {
				if(this.info.name === '') {
					this.$Message.error('请输入分类名称')
					return
				}
				this.save()
			}
		}
	}
</script>