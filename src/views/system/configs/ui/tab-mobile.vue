<template>
	<Form label-position="top">
		<Form-item label="登录地址">
			<Input :value="mobileUrl" disabled>
				<Button type="ghost" slot="append" :data-clipboard-text="mobileUrl" class="copy-btn">复制</Button>
			</Input>
		</Form-item>
		<Form-item label="系统名称(登录页及标题栏显示)">
			<Input v-model="info.system_name" placeholder="请输入系统名称"></Input>
		</Form-item>		
		<Form-item label="顶部Logo(格式:.jpg格式,尺寸:最大宽度375px，最大高度70px,文件大小:<= 200KB)">
			<img :src="info.logo" style="max-width: 375px;height: 70px;background: #03a9f3;"><br>
			
			<Dropdown class="ml-2">
				<Button size="small" :loading="upload_process" type="ghost" icon="ios-cloud-upload-outline" class="mt-2">更换顶部LOGO</Button>
				<DropdownMenu slot="list">
					<DropdownItem>
						<x-upload
							ref="upload"
							:headers="upload_header" 
							:show-upload-list="false"
							:on-success="handleUploadSuccess"
							:on-error="handleUploadError"
							:format="['jpg','jpeg','png']"
							:max-size="1024"
							:on-format-error="handleFormatError"
							:on-exceeded-size="handleMaxSize"
							:on-progress="handleUploadProgress"
							:before-upload="handleUploadBefore"
							name="file"
							type="select">
							<span>直接上传</span>
							
						</x-upload>
					</DropdownItem>
					<DropdownItem @click.native="selectFromMyFile">从我的文件选择</DropdownItem>
					<DropdownItem @click.native="inputIcon">输入图标地址</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</Form-item>
		<Form-item>
			<Button type="primary" @click="save">保存</Button>
		</Form-item>
	</Form>
</template>

<script>
	import ui from './ui.mixin'
	import XUpload from 'c%/xupload/index'
	export default{
		mixins: [ui],
		components:{
			XUpload
		},	
		props: {
			info: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		data () {
			return {
			}
		},
		methods: {
			handleUploadSuccess (res, file) {
				this.upload_process = false
	        	this.info.logo = res.data.file_url
			},
			inputIcon(){
				let icon = this.info.logo
				this.$Modal.confirm({
                    render: (h) => {
                        return h('Input', {
                            props: {
                                value: icon,
                                autofocus: true,
                                placeholder: '请输入图标地址...'
                            },
                            on: {
                                input: (val) => {
                                    icon = val;
                                }
                            }
                        })
					},
					onOk:()=>{
						if(!/^\s*$/.test(icon)){
							this.info.logo = icon
						}
					}
                })
			},
			selectFromMyFile(){
				this.$Modal.open('components/SelectFile.vue@modal',{
					props: {
						selType: 'image',
						'hide-upload-bylocal': true
					},
					on: {
						'selected':(data)=>{
							this.info.logo = data.file_url
						}
					}
				})
				.then(modal => {
					modal.vuec.show('选择图标','list')
				})
			}
		}
	}
</script>

<style>
</style>