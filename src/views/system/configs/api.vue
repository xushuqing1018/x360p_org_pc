<template>
	<div class="page-grid">
		<Card dis-hover>
	        <div slot="title">
	        	API接口配置
	        </div>
		    <div>
	        	<Form :label-width="120" label-position="top">
	        		<Form-item label="SecretKey">
	        			<Input v-model="config.secret" placeholder="请输入SecretKey" style="width:40%"></Input>
	        		</Form-item>

	        		<Form-item label="消息推送回调URL">
	        			<Input v-model="config.message_push_callback_url" placeholder="请配置消息推送回调URL" style="width:40%"></Input>
	        			<Button type="primary" @click="testPush" :loading="loading1">测试回调</Button>
	        		
	        			<Button type="ghost" @click="showMessage=true">数据样例</Button>
	        			<div class="example" v-show="showMessage">
	        				<Button type="default" @click="showMessage=false">关闭</Button>
	        				<p>POST:</p>
        					<p>签名算法: 将所有的键值按a-z排序以后拼接成字符串 key1=v1&key2=v2....keyn=vn 然后再后面加上 &secret=安全码 构成一个新的字符串，然后再md5,签名验证要排除掉 "signature" 字段</p>
        					<div class="example-wrap">
	        					<pre>{{message_push}}</pre>
							</div>
	        			</div>
	        		</Form-item>
	        		<Form-item label="学习管家账号注册回调URL">
	        			<Input v-model="config.user_signup_callback_url" placeholder="请配置用户注册回调URL" style="width:40%"></Input>
	        			<Button type="primary" @click="testSignup" :loading="loading2">测试回调</Button>
	        			<Button type="ghost" @click="showUserSignup=true">数据样例</Button>
	        				
	        			<div class="example" v-show="showUserSignup">
	        				<Button type="default" @click="showUserSignup=false">关闭</Button>
	        				<p>POST:</p>
        					<p>签名算法: 将所有的键值按a-z排序以后拼接成字符串 key1=v1&key2=v2....keyn=vn 然后再后面加上 &secret=安全码 构成一个新的字符串，然后再md5,签名验证要排除掉 "signature" 字段</p>
        					<div class="example-wrap">
	        					<pre>{{user_signup}}</pre>
							</div>
	        			</div>
	        		</Form-item>
	        		<Form-item label="学员信息修改回调URL">
	        			<Input v-model="config.user_modify_callback_url" placeholder="请配置学员信息修改回调URL" style="width:40%"></Input>
	        			<Button type="primary" @click="testModify" :loading="loading3">测试回调</Button>
	        			<Button type="ghost" @click="showUserModify=true">数据样例</Button>
	        				
	        			<div class="example" v-show="showUserModify">
	        				<Button type="default" @click="showUserModify=false">关闭</Button>
	        				<p>POST:</p>
        					<p>签名算法: 将所有的键值按a-z排序以后拼接成字符串 key1=v1&key2=v2....keyn=vn 然后再后面加上 &secret=安全码 构成一个新的字符串，然后再md5,签名验证要排除掉 "signature" 字段</p>
        					<div class="example-wrap">
	        					<pre>{{user_signup}}</pre>
							</div>
	        			</div>
	        		</Form-item>
	 
	        	</Form>
		        <div class="footer-btn" style="padding-left: 0;">
			        <Button type="primary" @click="handleSubmit()">保存配置</Button>		        
				</div>  
			</div>
	    </Card>
    </div>
</template>
<style lang="less">
.example{
	padding-top:15px;
}
.example-wrap{
	max-height:300px;
	overflow-y:scroll;
	background:#f2f2f2;
	padding:10px;
}
</style>
<script>
	import config from '@/libs/config.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	export default{
		mixins:[config,globals,common],
		data () {
			this.message_push = {
				"title": "收到一条新的考勤通知!",
			    "context": "新的考勤通知！学员姓名：圆圆,时间：2018-04-21 10:15,地点：香瑞园校区!",
			    "sid": 15,
			    "message_type": 2,
			    "relation_id": 36,
				"signature": "15459924a44c5dd7f81afe7f63f48804"
			}
			this.user_signup = {
				"uid": 10010,
               "og_id": 0,
               "account": "13590400035",
               "mobile": "13590400035",
               "email": "",
               "name": "李三",
               "sex": "1",
               "user_type": 2,
               "salt": "pjL86w",
               "password": "8cf98831c80f0561fc64598688d9cbf8",
               "avatar": "",
               "openid": "",
               "default_sid": 4,
               "is_mobile_bind": 0,
               "is_email_bind": 0,
               "is_weixin_bind": 0,
               "last_login_time": 0,
               "last_login_ip": "",
               "login_times": 0,
               "create_time": "2018-04-18 17:22:34",
               "status": 1,
               "is_main": 0,
               "is_admin": 0,
               "update_time": 1525921526,
               "create_uid": 10001,
               "is_delete": 0,
               "delete_time": null,
               "delete_uid": 0,
               "reset_time": null,
               "reset_token": null,
               "sid": 4,
               "bid": 2,
               "student_name": "廖一Yi",
               "pinyin": "",
               "pinyin_abbr": "",
               "nick_name": "Yi",
               "photo_url": "http://s10.xiao360.com/qms/student_avatar/10001/18/04/27/defee772b5c45393098c5581201f2f56.jpeg",
               "birth_time": 0,
               "birth_year": 0,
               "birth_month": 0,
               "birth_day": 0,
               "school_grade": 0,
               "school_class": "0",
               "school_id": 1,
               "first_tel": "13530200068",
               "first_family_name": "廖志强",
               "first_family_rel": 4,
               "first_uid": 10009,
               "second_family_name": "香瑞园",
               "second_family_rel": 0,
               "second_tel": "",
               "second_uid": 0,
               "eid": 0,
               "sno": "",
               "card_no": "",
               "money": "0.00",
               "credit": "0.00",
               "credit2": "0.00",
               "vip_level": 0,
               "last_attendance_time": "2018-05-05 10:15:00",
               "is_lost": 0,
               "quit_reason": "",
               "student_type": 1,
               "option_fields": [],
               "student_lesson_times": 64,
               "student_lesson_remain_times": 35,
               "student_lesson_hours": "64.00",
               "student_lesson_remain_hours": "34.00",
               "ext_id": "",
               "first_openid": "",
               "second_openid": "",
			   "signature": "03f499c04e01ce35884a3669c95885f8"
			}
			return {
				show_form:false,
				cfg_name:'org_api',
				config: {					
					
				},
				showMessage:false,
				showUserSignup:false,
				showUserModify:false,
				loading1: false,
				loading2: false,
				loading3: false
			}
		},
		methods: {
			testPush() {
				this.loading1 = true
				this.$rest('callback')
				.post({
					url: this.config.message_push_callback_url,
					data: this.message_push
				})
				.success(res => {
					this.$Message.success('测试数据发送测试成功！')
					this.loading1 = false
				})
				.error(res => {
					this.loading1 = false
					this.error(res.body.message)
				})
			},
			testSignup() {
				this.loading2 = true
				this.$rest('callback')
				.post({
					url: this.config.user_signup_callback_url,
					data: this.user_signup
				})
				.success(res => {
					this.$Message.success('测试数据发送成功！')
					this.loading2 = false
				})
				.error(res => {
					this.loading2 = false
					this.error(res.body.message)
				})
			},
			testModify() {
				this.loading3 = true
				this.$rest('callback')
				.post({
					url: this.config.user_modify_callback_url,
					data: this.user_signup
				})
				.success(res => {
					this.$Message.success('测试数据发送成功！')
					this.loading3 = false
				})
				.error(res => {
					this.loading3 = false
					this.error(res.body.message)
				})
			}
		}
	}
</script>