<template>
	<div>
		<div class="row">
			<div class="col-md-6 col-sm-12">
				<qrsign-setting :config="config" v-model="tab"></qrsign-setting>
			</div>
			
			<div class="col-md-6 col-sm-12">
				<qrsign-preview :config="config" :tab="tab"></qrsign-preview>
			</div>
		</div>
		
		<div class="mt-3 footer-btn" style="padding-left: 0;">
	        <Button type="primary" @click="save()">保存配置</Button>		        
		</div>  
	</div>
</template>

<script>
	import config from '@/libs/config.mixin'
	import common from '@/libs/common.mixin'
	import QrsignSetting from './qrsign/setting.vue'
	import QrsignPreview from './qrsign/preview.vue'
	
	export default{
		mixins: [ common, config ],
		components: {
			QrsignSetting,
			QrsignPreview
		},
		data () {
			return {
				tab: '1',
				cfg_name: 'qrsign',
				config: {
					banner: '/static/img/org/qrsign-bg.png',
					logo: '/static/img/logo.png',
					title: '市场名单资料',
					desc: '提交信息后我们的工作人员将会在3个工作日内联系您',
					fields: [
						{ field: 'grade',label:'年　　级', placeholder:'请输入年级', enable: true, default_value:'' },
						{ field: 'email',label:'邮　　箱', placeholder:'请输入邮箱', enable: true, default_value:'' }
					],
					must_fields: [
						{ field: 'birth_time',label:'出生日期', placeholder:'请选择日期', enable: true, default_value: '2012-01-01'}
					],
					msg: {
						title: '操作成功',
						description: '您的信息我们已经收到，我们会尽快与您联系!',
						redirect_url: ''
					}
				}				
			}
		},
		mounted(){
			this.initOptionFields()
		
		},
		methods: {			
			save () {				
				this.handleSubmit()
			},
			initOptionFields(){
				let option_fields = this.$store.state.gvars.configs.mcl_option_fields
				option_fields.forEach(f=>{
					if(f.enable == 1){
						this.config.fields.push({
							field:f.name,
							label:f.label,
							placeholder:'请输入'+f.label,
							enable:true
						})
					}
				})	
			}	
		},
		computed: {
			
		}
	}
</script>
<style lang="less" scoped>
@import url("./qrsign/qrsign.less");
</style>