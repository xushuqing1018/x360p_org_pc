<template>
	<Form label-position="top">
		<h1 style="margin-bottom: 10px;">全局配置</h1>
		<Form-item label="界面风格">
			<RadioGroup size="small" v-model="info.theme" type="button">
				<Radio label="default">暗黑</Radio>
				<Radio label="light">亮白</Radio>
			</RadioGroup>
		</Form-item>
		<Form-item label="登录地址">
			<Input :value="pcUrl" disabled>
				<Button type="ghost" slot="append" :data-clipboard-text="pcUrl" class="copy-btn">复制</Button>
			</Input>
		</Form-item>
		<Form-item label="系统名称(登录页及标题栏显示)">
			<Input v-model="info.system_name" placeholder="请输入系统名称"></Input>
		</Form-item>
		<Form-item label="版权信息">
			<Input v-model="info.copyright" placeholder="请输入系统名称"></Input>
		</Form-item>
		<Form-item label="登录页背景图(格式:jpg格式,尺寸:1920px*1080px,文件大小:<=5MB)">
			<img :src="info.login_img" style="height: 120px;"><br>
			<c-upload 
				v-model="info.login_img"
				btn-text="更换登录页背景图"
			>
			</c-upload>
				
		</Form-item>
		<Form-item label="顶部Logo(展开)(格式:png(透明).jpg格式,尺寸:200px*50px,文件大小:<= 200KB)">
			<img :src="info.big_logo" style="width: 200px;height: 50px;background: #03a9f3;"><br>
			<c-upload 
				v-model="info.big_logo"
				btn-text="更换顶部LOGO(展开)"
			>
			</c-upload>
			
		</Form-item>
		<Form-item label="顶部Logo(折叠)(格式:png(透明).jpg格式,尺寸:60px*50px,文件大小:<=100KB)">
			<img :src="info.small_logo" style="height: 50px;background: #03a9f3;"><br>
			<c-upload 
				v-model="info.small_logo"
				btn-text="更换顶部LOGO(收起)"
			>
			</c-upload>
			
		</Form-item>
		<Form-item label="加载Loading图片(格式:gif(透明)尺寸:120px*120px,文件大小:<=100KB)">
			<img :src="info.loading_img" style="height: 60px;background: #03a9f3;"><br>
			<c-upload 
				v-model="info.loading_img"
				btn-text="更换Loading图片(收起)"
			>
			</c-upload>
			
		</Form-item>
		<h1 style="margin-bottom: 10px;">登录框配置</h1>
		<Form-item label="登录框样式">
			<RadioGroup size="small" v-model="info.login_box_style" type="button">
				<Radio label="1">单纯登录框</Radio>
				<Radio label="2">登录框背景+登录框</Radio>
			</RadioGroup>
		</Form-item>
		<Form-item label="登录框背景图(格式:jpg格式,文件大小:<=5MB)" v-if="info.login_box_style == 2">
			<img :src="info.login_box_bg" style="height: 120px;"><br>
			<c-upload 
				v-model="info.login_box_bg"
				btn-text="更换登录框背景图"
			>
			</c-upload>
				
		</Form-item>
		<Form-item label="登录标题" v-if="info.login_box_style == 2">
			<RadioGroup size="small" v-model="info.login_box_title_style" type="button">
				<Radio label="1">显示文字</Radio>
				<Radio label="2">显示文字+Logo</Radio>
			</RadioGroup>
		</Form-item>
		<Form-item label="登录标题Logo(格式:png(透明).jpg格式,尺寸:60px*50px,文件大小:<=100KB)" v-if="info.login_box_title_style == 2 & info.login_box_style == 2">
			<img :src="info.login_box_title_logo" style="height: 50px;background: #03a9f3;"><br>
			<c-upload 
				v-model="info.login_box_title_logo"
				btn-text="更换登录标题LOGO"
			>
			</c-upload>
			
		</Form-item>
		<Form-item label="">
			<span style="margin-right:30px;">登录按钮颜色</span>
			<ColorPicker v-model="info.login_box_btn_color" recommend/>
		</Form-item>

		<Form-item label="是否显示语言切换" v-if="is_gm">
			<i-switch v-model="info.show_lang_btn" :true-value="1" :false-value="0">
				<span slot="open">是</span>
				<span slot="close">否</span>
			</i-switch>
		</Form-item>
		
		<Form-item>
			<Button type="primary" @click="save">保存</Button>
		</Form-item>
	</Form>
</template>

<script>
	import ui from './ui.mixin'
	import common from '@/libs/common.mixin'
	import cUpload from 'c%/cUpload.vue'
	export default{
		components:{
			cUpload
		},		
		mixins: [ui,common],
		props: {
			info: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		created: function () {
			this.info.login_box_style = this.info.login_box_style + ""
			this.info.login_box_title_style = this.info.login_box_title_style + ""
  		},
		data () {
			return {
				upload_process: false,
				upload_percent: 0
			}
		},		
		methods: {
			
        }
	}
	
</script>

<style>
</style>