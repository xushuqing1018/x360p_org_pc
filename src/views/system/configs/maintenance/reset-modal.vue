<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="550">
		<div class="maintenance-modal-content">
			<div class="reset-data" v-if="!reset.status">
				<div class="phone-container">
					<label>手机号：</label>
					<Input 
						readonly
						v-model="reset.phone" 
						placeholder='请输入您的手机号' 
						style="width:240px">
						</Input>
				</div>
				<div class="captcha-container">
					<label>验证码：</label>
					<Input 
						v-model="reset.captcha" 
						placeholder="请输入验证码" 
						style="width:150px">
					</Input>
					<Button 
						class="btn-captcha" 
						type="primary" 
						size="small"
						@click="sendCapt"
						v-if="!send.loading">
						{{send.text}}
					</Button>
					<Button 
						class="btn-captcha" 
						type="primary" 
						shape="circle"
						size="small"
						v-else>
						{{send.text}}
					</Button>
				</div>
				<!--
				<div class="branch-del">
					<label v-help="scope_tip">校区范围：</label>
					<RadioGroup v-model="reset.bid" type="button" size="small">
						<Radio :label="0">所有</Radio>
						<Radio :label="bid$">{{bid$|branch_name}}</Radio>
					</RadioGroup>
				</div>
			-->
				<div class="select-container">
					<label>是否同时删除基础数据(勾选即删除，不勾则保留)：</label>
					<CheckboxGroup v-model="reset.table" style="display:inline-block">
						<Checkbox v-for="item in delete_map" :label="item.value">{{item.label}}</Checkbox>
					</CheckboxGroup>
				</div>
			</div>
			<div class="msg" v-html="info.content" v-else></div>
			<Icon type="happy" color="#19be6b" v-if="info.status" size="18"></Icon>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close" :disabled="saving">关闭</Button>
			<Button type="primary" @click="resetSystem" v-if="!reset.status" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>
<script>
	const emptyObject = {
		phone: '',
		captcha: '',
		table: [],
		status: false,
		bid: 0
	}

	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		props: {
			data: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		mixins: [modal,common,globals],
		data() {
			return {
				reset: util.copy(emptyObject),
				send: {
					text: '获取验证码',
					loading: false,
				},
				tId: null,
				delete_map: [
					{value:'market_channel',label:'市场渠道'},
					{value:'market_clue',label:'市场名单'},
					{value:'student',label:'学员'},
					{value:'customer',label:'客户'},
					{value:'customer_follow_up',label:'客户跟进记录'},
					{value:'employee',label:'员工'},
					{value:'user',label:'账号'},
					{value:'lesson',label:'课程'},
					{value:'lesson_standard_file',label:'课标'},
					{value:'subject',label:'科目'},
					{value:'material',label:'物品'},
					{value:'classroom',label:'教室'},
					{value:'holiday',label:'节假日'},
					{value:'public_school',label:'公立学校'},
					{value:'time_section',label:'时间表'},
					{value:'wxmp',label:'微信公众号'}
				],
				info: {},
				scope_tip:'如果选择指定校区，那么恢复数据将只对指定校区数据做恢复!'
			}
		},
		computed: {
			user() {
				return this.$store.state.user
			},
			mobile_admin() {
				return this.user.info.mobile || ''
			}
		},
		methods: {
			resetSystem() {
				if(!this.reset.captcha) {
					this.$Message.error('验证码不能为空')
					return false
					if(!/^\d{4}/.test(this.reset.captcha)) {
						this.$Message.error('验证码只能是四位数字')
						return false
					}
				}
				this.reset_start()
			},
			reset_start() {
				let params = {
					mobile: this.reset.phone,
					reset_code: this.reset.captcha,
					table: this.reset.table
				}
				this.$rest(this.info.url)
				.post(params)
				.success(res => {
					this.clearInter()
					this.modal$.title = '重置数据'
					this.reset.status = true
					this.info.status = 1
					this.info.content += '<p>重置成功</p>'
					this.$Message.success('重置成功')
					this.$store.dispatch('updateGlobalVar','all')
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			sendCapt() {
				if(!this.reset.phone) {
					this.$Message.error('手机号码不能为空')
					return false
				}
				this.getCapt()
			},
			getCapt() {
				let time = 59
				if(this.send.loading) {
					return false
				}
				this.send = {loading: true,text: '60'}
				this.tId = setInterval(() => {
					if(time < 10) {
						time = '0' + time
					}
					this.send.text = time
					time --
					if(time < 0) {
						this.clearInter()
					}
				}, 1000)
				this.$rest('open/vcode')
				.post({mobile:this.reset.phone,type:'reset_code'})
				.success(response => {
					this.$Notice.success({
	                    title: '验证码已发送',
	                    desc: '请在绑定的手机上查看'
	                })
				})
				.error(response => {
					this.$Notice.error({
	                    title: '获取验证码失败',
	                    desc: response.body.message
	                })
	                clearInterval(this.tId)
	                this.send = {loading: false,text: '发送验证码'}
				})
			},
			clearInter() {
				clearInterval(this.tId)
				this.send = {loading: false,text: '发送验证码'}
			}
		},
		watch: {
			'modal$.show': function(val) {
				if(val) {
					this.info = util.copy(this.data)
					this.reset = util.copy(emptyObject)
					this.reset.phone = this.mobile_admin
				}else{
					this.clearInter()
				}
			}
		}
	}
</script>
