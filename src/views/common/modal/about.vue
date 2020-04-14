<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="580">
		<div class="row about" style="align-items:center;justify-content:center;">
			<div class="col-sm-4">
				<img src="../../../img/logo-1.jpg"/>
			</div>
			<div class="col-sm-8">
				<div class="title">{{is_orgs?'系统':'校360'}}<sup>专业版</sup>
					<Badge dot v-if="hasLatestVersion">
						<a class="text-primary" @click="showVerList">({{info.current_version}})</a>
					</Badge>
					<a class="text-primary" @click="showVerList" v-else>({{info.current_version}})</a>
				</div>
				<div class="item">授权给：{{info.client_name}}</div>
				<div class="item">到期日期：{{info.expire_day|int_date}}
					(<span v-if="is_expire" class="text-danger">已过期</span>
					<span v-else>剩余<span class="text-danger">{{rest_days}}</span>天</span>)
					<a target="_blank" class="mr-4 pull-right" :href="vip.charge">现在续费</a>
				</div>
				<div class="item">
					<span>{{capacity_text}}</span>：
					<Progress 
						status="normal" 
						:percent="numsPercent" 
						style="width:150px;vertical-align:middle;padding-bottom:2px" 
						:stroke-width="14">
					</Progress>
					<a target="_blank" class="mr-4 pull-right" :href="vip.expand" v-if="!is_orgs">现在扩容</a>
					<div class="rest-capacity">剩余{{remian_num}}(许可:{{num_limit}},已用:{{use_num}})</div>
				</div>
			</div>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close" v-if="is_orgs">关闭</Button>
			<div class="text-center" v-else><a href="https://www.lantel.net" target="_blanK">深圳浪腾计算机信息技术有限公司</a>&nbsp;&nbsp;&nbsp;&copy;2010-{{curYear}} 联系电话：400-621-8114</div>
		</div>
		<version-info ref="version_info"></version-info>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import VersionInfo from './version-info'

	export default {
		mixins: [modal,common],
		components: {
			VersionInfo
		},
		data() {
			return {
				info: {
					student_num_limit: 0
				},
				status: {
					student_num: 0
				},
				is_expire: false
			}
		},
		methods: {
			onModalOpen() {
				this.$rest('organization')
				.get()
				.success(response => {
					this. info = response.client_info
					this.status = response.client_status
				})
				.error(response => {
					this.$Message.error(response.body.message)
				})
			},
			showVerList() {
				this.$store.commit('updateLatestVersionRead')
				this.$refs.version_info
				.init_data()
				.show('版本历史','list')
			}
		},
		computed: {
			hasLatestVersion(){
		      return this.$store.state.latest_version.ver != '' && this.$store.state.latest_version.read == 0
		    },
		    capacity_text() {
		    	let text = ''
		    	if(this.info.is_student_limit == 1) {
					text = '学员容量'
				}else if(this.info.is_branch_limit == 1) {
					text = '校区容量'
				}else if(this.info.is_account_limit) {
					text = '账号容量'
				}
				return text
		    },
		    pay_type() {
		    	let type = ''
		    	if(this.info.is_student_limit == 1) {
					type = 'student'
				}else if(this.info.is_branch_limit == 1) {
					type = 'branch'
				}else if(this.info.is_account_limit) {
					type = 'account'
				}
				return type
		    },
		    num_limit(){
		    	let num = 0 
		    	if(this.info.is_student_limit == 1) {
					num = this.info.student_num_limit
				}else if(this.info.is_branch_limit == 1) {
					num = this.info.branch_num_limit
				}else if(this.info.is_account_limit) {
					num = this.info.account_num_limit
				}
				return num
		    },
		    use_num(){
		    	let num = 0 
		    	if(this.info.is_student_limit == 1) {
					num = this.status.student_num
				}else if(this.info.is_branch_limit == 1) {
					num = this.status.branch_num
				}else if(this.info.is_account_limit) {
					num = this.status.user_num
				}
				return num
		    },
		    remian_num() {
		    	let num = 0
				if(this.info.is_student_limit == 1) {
					num = this.info.student_num_limit - this.status.student_num
				}else if(this.info.is_branch_limit == 1) {
					num = this.info.branch_num_limit - this.status.branch_num
				}else if(this.info.is_account_limit) {
					num = this.info.account_num_limit - this.status.user_num
				}
  				return num
		    },
			numsPercent() {
				let percent = 0
				if(this.info.is_student_limit == 1) {
					percent = Math.round(100*(util.div(this.status.student_num,this.info.student_num_limit)))
				}else if(this.info.is_branch_limit == 1) {
					percent = Math.round(100*(util.div(this.status.branch_num,this.info.branch_num_limit)))
				}else if(this.info.is_account_limit) {
					percent = Math.round(100*(util.div(this.status.user_num,this.info.account_num_limit)))
				}
  				return percent
			},
			rest_days() {
				let expire_time = Date.parse(this.$filter('int_date')(this.info.expire_day)),
					today_time  = Date.parse(new Date()),
					rest 		= expire_time - today_time
				if(rest > 0) {
					return Math.round(rest / 1000  /  60  /  60  / 24)
				}else{
					return 0
				}
			},
			vip() {
				let info = this.$store.state.user.info,
					url  = info.product_url.split('//'),
					token = info.token,
					charge = '',
					expand = ''
				charge = util.sprintf("%s//vip.%s/#/renew?token=%s",url[0],url[1],token)
				expand = util.sprintf("%s//vip.%s/#/expand?token=%s&f=%s",url[0],url[1],token,this.pay_type)
				return {charge,expand}
			},
			curYear(){
				return (new Date()).getFullYear()
			}
		}
	}
</script>
<style lang="less">
	.about {
		img {
			width: 180px;
			height: 180px;
		}
		.title {
			font-size: 18px;
			padding: 5px 0 10px;
		}
		.item {
			font-size: 14px;
			padding: 5px 0;
		}
		.rest-capacity {
			font-size: 12px;
			color: #999;
			padding-left: 75px;
		}
	}
</style>