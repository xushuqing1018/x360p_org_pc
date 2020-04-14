<template>
	<Modal :title="modal$.title" v-drag-modal v-model="modal$.show" :mask-closable="false" width="800">
		<template v-if="modal$.show">
			<Form :label-width="120" ref="form" :model="info" class="filter-form">
        		<Form-item prop="file_url" label="原文件路径：" v-if="info.file_url">
        			<span>{{info.file_url}}</span>
        		</Form-item>
        		<Form-item prop="file_type" label="文件类型：">
        			<span>{{info.file_type}}</span>
        		</Form-item>
        		<Form-item prop="new_file_url" label="新文件URL：">
        			<Input type="text" v-model="new_file_url"></Input>
        		</Form-item>
        	</Form>
		</template>
		<div slot="footer">
            <Button type="ghost" :loading="saving" @click="close">取消</Button>
            <Button type="primary" :loading="saving" @click="ok">确定</Button>
        </div>
	</Modal>	
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [modal,common],
		data() {
			return {
				info: {},
				new_file_url: ''
			}
		},
		methods: {
			ok() {
				if(this.new_file_url === '') {
					this.$Message.error('文件路径不能为空')
					return false
				}
				let msg = this.modal$.action == 'add'?'添加成功':'编辑成功'
				this.$rest('files')
				.add_url_param(this.info.file_id)
				.put({file_url: this.new_file_url})
				.success(response => {
					this.$Message.success(msg)
					this.$emit('save')
					this.close()
				})
				.error(response => {
					this.error(response.body.message)
				})
			}
		},
		watch: {
			'modal$.show': function(val) {
            	if(val){
					this.new_file_url = ''
				}	            
	        }
        },
	}
</script>