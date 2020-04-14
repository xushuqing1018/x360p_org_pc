<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="800" :mask-closable="false">
		<div v-if="type=='host'">
			<Input :value="subhost" readonly>
				<Button slot="append" type="ghost" class="copy-btn" :data-clipboard-text="subhost">复制</Button>
			</Input>
			<div class="mt-3">
				<Alert show-icon>
					提示：请在微信支付商家后台的「产品中心」「<a href="https://pay.weixin.qq.com/index.php/extend/pay_setting" target="_blank">开发配置</a>」菜单下面，进行支付授权目录设置.
				</Alert>
			</div>
		</div>
		
		<div class="row" v-else>
			<div class="col-md-6">
				<p class="mb-3"><strong>支付界面商户名显示</strong></p>
				<div class="mb-3" >
					<Input style="width: calc(100% - 64px);" v-model="copy_codepay_title" placeholder="请输入商户名称"></Input>
					
					<Button type="primary" @click="save">保存</Button>								
				</div>
				<p class="mb-3"><strong>缴费码支付二维码</strong></p>
				<div class="qrcontainer">
					<qrcode ref="qrcode" :size="290" :value="codepay" type="img"></qrcode>
				</div>
				<div class="center mt-3">
					<a @click="download"><Icon type="android-download"></Icon> 下载二维码</a>
				</div>
				<div class="mt-3">
				<Alert show-icon>
					下载二维码后打印或印刷出来贴在前台，家长可扫描二维码后凭缴费码快速缴费
				</Alert>
			</div>
			</div>
			<div class="col-md-6">				
				<p>
					<strong>微信支付,手机预览效果图如下</strong>
				</p>
				<div style="position:relative" class="text-center">
					<p class="codepay-title">
						<Icon type="ios-home-outline"></Icon>
						{{copy_codepay_title}}
					</p>
					<img style="width:330px" src="/static/img/codepay.png">
				</div>
			</div>
			
			<a ref="downloadhref"></a>
		</div>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import config from '@/libs/config.mixin'
	import qrcode from 'c%/qrcode'
	import Clipboard from 'clipboard'
	
	var clipboard = null
	export default{
		mixins: [ modal,config ],
		components: {
			qrcode
		},
		data () {
			return {
				type: 'host',
				cfg_name:'school_mobile',
				cfg_id: 0,
				config: {					
					codepay_title: '校360商户'	
				},
				copy_codepay_title: '校360商户'
			}
		},
		watch: {
			'config.codepay_title': function (val) {
				this.copy_codepay_title = val
			},
			'modal$.show': function (val) {
				this.copy_codepay_title = this.config.codepay_title
//				if(val){
//					this.init_config_data()
//				}
			}
		},
		mounted () {		
			//dom加载完毕后绑定事件
			clipboard = new Clipboard('.copy-btn')
			clipboard.on('success', (e)=> {
			    this.$Message.success('复制成功！')			
			    e.clearSelection()
			})
		},
		destroyed () {			
			//离开页面时销毁
			clipboard.destroy()
		},
		methods: {
			save () {
				this.config.codepay_title = util.copy(this.copy_codepay_title)
				this.handleSubmit()
			},
			download () {
				var sampleImage = this.$refs.qrcode.$el.querySelector("img"),
			    	canvas = this.convertImageToCanvas(sampleImage),
			    	url = canvas.toDataURL("image/png"),
			    	downloadhref = this.$refs.downloadhref
			    
			    //以下代码为下载此图片功能
			    downloadhref.setAttribute("href",url)
			    downloadhref.setAttribute("download","qrcode.png")
			    			    
			    downloadhref.click()
			},
			convertImageToCanvas (image) {
			    var canvas = document.createElement("canvas");
			    canvas.width = image.width;
			    canvas.height = image.height;
			    canvas.getContext("2d").drawImage(image, 0, 0);
			    return canvas;
			}
		},
		computed: {			
			subhost () {
				let user = this.$store.state.user
				
				return user.info.base_url+'/school#/'
			},
			codepay () {
				return this.subhost+'codepay'
			}
		}
	}
</script>

<style>
	.codepay-title{
        position: absolute;
	    top: 170px;
	    left: 40px;
	    font-size: 18px;
	    width: 286px;
	    text-align: center;
	}
	.qrcontainer{
		padding:40px;
		background:#f2f2f2;
	}
</style>