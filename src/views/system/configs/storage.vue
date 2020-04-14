<template>
	<div class="page-grid">
		<Card dis-hover>
	        <div slot="title">
	        	<a href="https://portal.qiniu.com/signup?code=3laiccx4xi6he" target="_blank">七牛</a>云存储配置
	        </div>
	        <Alert show-icon v-show="config.qiniu.access_key == '' || show_form">
		        云存储开通说明
		        <Icon type="ios-lightbulb-outline" slot="icon"></Icon>
		        <template slot="desc">
		        	系统默认赠送 <Tag color="red">2G</Tag> 的云存储空间，用于存放所有的上传文件附件包括图像、语音、小视频等。
		        	<br>
		        	您可以<Tag color="blue">免费</Tag>的开通七牛云存储，获取更多的存放空间，并且文件存储在您自己的云存储账号上面。
		        	<br>
		        	您需要 <a target="_blank" href="https://portal.qiniu.com/signup?code=3laiccx4xi6he">先前往申请</a> 账号，如果您已经有七牛云存储账号，只需将相关云存储的配置信息填写到下面的配置表格即可。
		        	<br>
		        	如果您在操作上有任何疑问，可以与我们的客服联系，获取更多帮助。
		        	<br>
		        	<Button type="primary" @click="show_form = true">我要使用自己的云存储账号</Button>
		        </template>
		    </Alert>
		    <div v-show="config.qiniu.domain != '' || show_form">
	        	<Form>
	        		
	        		<Form-item label="AccessKey">
	        			<Input v-model="config.qiniu.access_key" placeholder="请输入AK"></Input>
	        		</Form-item>
	        		<Form-item label="SecretKey">
	        			<Input v-model="config.qiniu.secret_key" placeholder="请输入SK"></Input>
	        		</Form-item>
	        		<Form-item label="Bucket">
	        			<Input v-model="config.qiniu.bucket" placeholder="Bucket"></Input>
	        		</Form-item>
	        		<Form-item label="资源前缀">
	        			<Input v-model="config.qiniu.prefix" placeholder="资源前缀"></Input>
	        		</Form-item>
	        		<Form-item label="访问域名">
	        			<Input v-model="config.qiniu.domain" placeholder="访问域名"></Input>
	        		</Form-item>
	        	</Form>
		        <div class="footer-btn" style="padding-left: 0;">
			        <Button type="primary" @click="handleSubmit()">保存配置</Button>		        
				</div>  
			</div>
	    </Card>
    </div>
</template>

<script>
	import config from '@/libs/config.mixin'
	import globals from '@/libs/globals.mixin'
	export default{
		mixins:[config,globals],
		data () {
			return {
				show_form:false,
				cfg_name:'storage',
				config: {
					engine:'qiniu',
					qiniu:{					
						access_key: '',
						secret_key:'',
						bucket:'',
						prefix:'',
						domain:''
					}
				}
			}
		}
	}
</script>