<template>
	<Form label-position="top">
		<Form-item label="品牌Logo(格式:.jpg、.jpeg、.png格式,尺寸:最大宽度375px，最大高度70px,文件大小:<= 1024KB)">
			<img :src="config.brand_logo" style="max-width: 375px;height: 70px;background: #03a9f3;">
			<span class="image-close" @click="delImage" v-if="config.brand_logo != ''" style="position: relative;right: 15px;top: -30px;">X</span>
			<c-upload v-model="config.brand_logo" btn-text="更换品牌Logo"></c-upload>
			
			
		</Form-item>
		<Form-item>
			<Button type="primary" @click="handleSubmit">保存</Button>
		</Form-item>
	</Form>
</template>

<script>
	import util from '@/libs/util'
	import config from '@/libs/config.mixin'
	import common from '@/libs/common.mixin'
    import globals from '@/libs/globals.mixin'
    import ui from '../ui.mixin'
	import cUpload from 'c%/cUpload.vue'
	export default{
		mixins:[common,config,globals,ui],
		components:{
			cUpload
		},
		data () {
			return {
                cfg_name:'student_mobile_ui',
				config: {
					brand_logo: ""
				}
			}
		},
		methods: {
			handleUploadSuccess (res, file) {
				this.upload_process = false
	        	this.config.brand_logo = res.data.file_url
            },
            delImage(){
                this.config.brand_logo = ""
			}
		}
	}
</script>

<style>
</style>