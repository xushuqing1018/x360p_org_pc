<style>
.img-responsive img{
	width:100%;
}
</style>
<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :mask-closable="false" width="600">
		<div>
			<template v-if="section == 'form'">
				<Form ref="form" :model="config" :label-width="80">			
					<Form-item label="盛开账号" class="ivu-form-item-required">
						<Input v-model.trim="config.account_name" placeholder="请输入盛开账号" style="width:348px;margin-right:15px;"></Input>
						<a href="https://www.sk-ai.com/Index/enroll" target="_blank">注册账号</a>
					</Form-item>
					<Form-item label="密码" class="ivu-form-item-required">
						<Input v-model.trim="config.password" placeholder="请输入盛开密码"></Input>
					</Form-item>
					<Form-item label="安全key" class="ivu-form-item-required">
						<Input v-model.trim="config.key" placeholder="请输入32位随机数(默认生成)" style="width:348px;margin-right: 15px;"></Input>
						<Button type="primary" @click="genKey">生成安全Key</Button>
					</Form-item>
				</Form>
				<Alert>
					人脸识别终端配置说明
					<div slot="desc">
						
						<p>1,请先下载终端App(仅支持IOS系统，iPhone或iPad) <Button size="small" @click="showQr" icon="arrow-down-a">下载安装终端App</Button></p>
						<p>2,打开App，点击App左上角的齿轮图标<Icon type="ios-gear"></Icon>进入设置界面，点击“设置识别回调”，然后再点击右边的 扫描地址图标 <Icon type="qr-scanner"></Icon>,然后对着屏幕的回调地址二维码进行扫描。
						<Button size="small" @click="showCQr" icon="qr-scanner">显示回调地址二维码</Button>
						</p>
						<p>3,登录<a href="https://skfrm.sk-ai.com/#/login" target="_blank">“盛开人脸识别管理系统”</a>,点击“终端管理”菜单，选择左边的任意一个终端分组，然后注意右下角出现的“绑定码“图标，点击绑定码。</p>
						<p>4,打开App,点击App左上角的齿轮图标<Icon type="ios-gear"></Icon>进入设置界面，点击“绑定小程序”后，对准屏幕出现的绑定二维码进行扫描.</p>

						
						
					</div>
				</Alert>
			</template>
			<div class="img-responsive" v-if="section=='qrshow'">
				<p>
					<Button size="small" @click="showForm">返回</Button>
				</p>
				<img src="https://sp1.xiao360.com/static/img/qr/skapp.jpg">
			</div>
			<div v-if="section=='cqrshow'">
				<p>
					<Button size="small" @click="showForm">返回</Button>
				</p>
				<p class="text-center">
					<qrcode ref="qrcode" :size="300" :value="callbackUrl" type="img"></qrcode>
				</p>
				<code>{{callbackUrl}}</code>
			</div>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :disabled="okDisabled" @click="ok">确认</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import config from '@/libs/config.mixin'
	import common from '@/libs/common.mixin'
	import qrcode from 'c%/qrcode'
	export default {
		mixins: [common,modal,config],
		components: {
			qrcode
		},
		data() {
			return {
				cfg_name:'app_faceatt',
				config: {
					account_name:'',
					password: '',
					key: ''
				},
				section:'form'
			}
		},
		computed:{
			callbackUrl(){
				let url = this.$store.state.user.info.base_url
				let curl = util.sprintf("%s/api/face_notify/attendance?key=%s",url,this.config.key)
				return curl
			},
			okDisabled(){
				if(this.section != 'form'){
					return true
				}
				return false
			}
		},
		methods: {
			initFinished() {
				if(this.cfg_id === 0) {
					this.genKey()
				}
			},
			ok() {
				if(this.config.account_name==='') {
					this.$Message.error('账号不能为空')
					return
				}
				if(this.config.password==='') {
					this.$Message.error('密码不能为空')
					return
				}
				if(this.config.key==='') {
					this.$Message.error('key不能为空')
					return
				}
				this.handleSubmit()
			},
			submitFinished() {
				this.close()
			},
			genCallback() {
				
			},
			genKey(){
				this.config.key = util.random(32)
			},
			showQr(){
				this.section = 'qrshow'
			},
			showForm(){
				this.section = 'form'
			},
			showCQr(){
				this.section = 'cqrshow'
			}
		}
	}
</script>