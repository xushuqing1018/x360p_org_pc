<template>
	<Modal :title="modal$.title" v-drag-modal v-model="modal$.show" :mask-closable="false" width="800">
		<template v-if="modal$.show">
			<Form :label-width="120" ref="form" :model="info" class="filter-form">
        		<Form-item prop="file_url" label="文件URL：">
        			<Input type="text" v-model="info.file_url"></Input>
        		</Form-item>
                <Form-item prop="file_name" label="文件名：">
        			<Input type="text" v-model="info.file_name"></Input>
        		</Form-item>
                 <Form-item prop="media_type" label="文件类型：">
        			<RadioGroup v-model="info.media_type" type="button">
                        <Radio label="image">图片</Radio>
                        <Radio label="video">视频</Radio>
                        <Radio label="file">文件</Radio>
                    </RadioGroup>
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
        name:'externalFileInputModal',
		mixins: [modal,common],
		data() {
			return {
				info: {
                    js_upload:1,
                    storage:'external',
                    file_name:'',
                    file_url:'',
                    file_size:0,
                    media_type:'image'
                }
			}
		},
		methods: {
			ok() {
				if(this.info.file_url === '') {
					this.$Message.error('文件URL不能为空')
					return false
                }
                if(this.info.file_name === '') {
					this.$Message.error('文件名不能为空')
					return false
                }
                
				let msg = this.modal$.action == 'add'?'添加成功':'编辑成功'
				this.$rest('upload')
				.post(this.info)
				.success(response => {
					this.$Message.success(msg)
					this.$emit('save',response.data)
					this.close()
				})
				.error(response => {
					this.error(response.body.message)
				})
			}
		}
	}
</script>