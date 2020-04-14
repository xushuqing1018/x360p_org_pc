<template>
	<div class="c-grid">
		<table class="params-table">
			<tbody>
				<tr><th colspan="4">报名缴费退费相关设置</th></tr>
				<tr>
					<td>报名缴费日期</td>
					<td>
						<p>
							<span>是否允许修改报名缴费日期</span>
							<Tag :color="config.student_signup.allow_modify_date?'green':'red'">
								{{config.student_signup.allow_modify_date?'是':'否'}}
							</Tag>
						</p>
						<p v-if="config.student_signup.allow_modify_date">							
							<template v-if="config.student_signup.modify_date_months > 0">
								<p>按月份：
									<span class="config-value">{{map_history_pass_months[config.student_signup.modify_date_months]}}</span>
								</p>
							</template>							
							<p  v-if="config.student_signup.modify_date_days > 0">
								按天数：允许<span class="config-value">{{config.student_signup.modify_date_days}}</span>天
							</p>
							<span v-else>按天数：不限制</span>
						</p>
					</td>
					<td>说明：不在允许天数之内或允许月数之内的不能补考勤，若同时设置了天数与月份，则优先使用天数规则</td>
					<td><Button type="text" size="small" @click="modifyConfig('signup')">修改</Button></td>
				</tr>
				<tr>
					<td>退费日期</td>
					<td>
						<p>
							<span>是否允许修改退费日期</span>
							<Tag :color="config.student_refund.allow_modify_date?'green':'red'">
								{{config.student_refund.allow_modify_date?'是':'否'}}
							</Tag>
						</p>
						<p v-if="config.student_refund.allow_modify_date">							
							<template v-if="config.student_refund.modify_date_months > 0">
								<p>按月份：
									<span class="config-value">{{map_history_pass_months[config.student_refund.modify_date_months]}}</span>
								</p>
							</template>							
							<p  v-if="config.student_refund.modify_date_days > 0">
								按天数：允许<span class="config-value">{{config.student_refund.modify_date_days}}</span>天
							</p>
							<span v-else>按天数：不限制</span>
						</p>
					</td>
					<td>说明：不在允许天数之内或允许月数之内的不能补考勤，若同时设置了天数与月份，则优先使用天数规则</td>
					<td><Button type="text" size="small" @click="modifyConfig('refund')">修改</Button></td>
				</tr>
				<tr>
					<td>储值</td>
					<td>
						<p>
							<Tag :color="config.student_signup.enable_debit?'green':'red'">
								{{config.student_signup.enable_debit?'是':'否'}}
							</Tag>
							<span>是否启用储值功能</span>
						</p>
						<p>
							<Tag :color="config.student_signup.enable_debit_card?'green':'red'">
								{{config.student_signup.enable_debit_card?'是':'否'}}
							</Tag>
							<span>是否启用储值卡储值</span>
						</p>
						<p>
							<Tag :color="config.student_signup.enable_debit_without_aa_id?'green':'red'">
								{{config.student_signup.enable_debit_without_aa_id?'是':'否'}}
							</Tag>
							<span>是否启用无收款账号储值</span>
						</p>
					</td>
					<td>开启后可以通过储值卡进行储值</td>
					<td><Button type="text" size="small" @click="modifyConfig('enable_debit_card')">修改</Button></td>
				</tr>
				<tr>
					<td>缴费打印模板</td>
					<td>
						<p>默认：<span class="config-value">{{config.student_signup.print_bill_type==1?'收据':'合同'}}</span></p>
					</td>
					<td>缴费成功之后打印收据或者合同</td>
					<td><Button type="text" size="small" @click="modifyConfig('print_bill_type')">修改</Button></td>
				</tr>
			</tbody>
			<tbody>
				<tr><th colspan="4">考勤相关设置</th></tr>
				<tr>
					<td>登记历史考勤</td>
					<td>
						<p>
							<span>是否允许登记历史考勤</span>
							<Tag :color="config.class_attendance.allow_reg_history?'green':'red'">
								{{config.class_attendance.allow_reg_history?'是':'否'}}
							</Tag>
						</p>
						<p v-if="config.class_attendance.allow_reg_history">							
							<p v-if="config.class_attendance.reg_history_pass_days > 0">
								按天数：允许<span class="config-value">{{config.class_attendance.reg_history_pass_days}}</span>天
							</p>
							<p v-else>按天数：不限制</p>
							<template v-if="config.class_attendance.reg_history_pass_months > 0">
								<p>按月份：
									<span class="config-value">{{map_history_pass_months[config.class_attendance.reg_history_pass_months]}}</span>
								</p>
							</template>
							<p v-else>按月份：不限制</p>
						</p>
					</td>
					<td>说明：不在允许天数之内或允许月数之内的不能补考勤，若同时设置了天数与月份，则优先使用天数规则</td>
					<td><Button type="text" size="small" @click="modifyConfig('allow_reg_history')">修改</Button></td>
				</tr>
				<tr>
					<td>撤销历史考勤记录</td>
					<td>
						<p>
							<span>是否允许撤销历史考勤记录</span>
							<Tag :color="config.class_attendance.allow_del_history?'green':'red'">
								{{config.class_attendance.allow_del_history?'是':'否'}}
							</Tag>
						</p>
						<p v-if="config.class_attendance.allow_del_history">							
							<p v-if="config.class_attendance.del_history_pass_days > 0">
								按天数：允许<span class="config-value">{{config.class_attendance.del_history_pass_days}}</span>天
							</p>
							<p v-else>按天数：不限制</p>
							<template v-if="config.class_attendance.del_history_pass_months > 0">
								<p>按月份：
									<span class="config-value">{{map_history_pass_months[config.class_attendance.del_history_pass_months]}}</span>
								</p>
							</template>
							<p v-else>按月份：不限制</p>
						</p>
					</td>
					<td>说明：不在允许天数之内或允许月数之内的不能撤销考勤记录，若同时设置了天数与月份，则优先使用天数规则</td>
					<td><Button type="text" size="small" @click="modifyConfig('allow_del_history')">修改</Button></td>
				</tr>
			</tbody>
		</table>
		<Spin size="large" fix v-if="loading"></Spin>
		<Button class="mt-2" type="primary" @click="restoreDefault">恢复默认设置</Button>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import config from '@/libs/config.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default{
		mixins:[config,common,globals],
		props: {
			cfgBid: {
				type: Number,
				default: 0
			}
		},
		data () {
			return {
				cfg_name:'params',
				config: {	
					class_attendance: {
						allow_reg_history: 1,
						reg_history_pass_days: 0,
						reg_history_pass_months: 0,
						allow_del_history: 1,						
						del_history_pass_days: 0,
						del_history_pass_months: 0
					},
					student_signup:{
						allow_modify_date:1,
						modify_date_days:365,
						modify_date_months:0,
						enable_debit_card:1,
						enable_debit:0,
						enable_debit_without_aa_id:0

					},
					student_refund: {
						allow_modify_date:1,
						modify_date_days:15,
						modify_date_months:0
					}
				}
			}
		},
		created() {
			this.cfg_name = `params&bid=${this.cfgBid}`
		},
		watch: {
			cfgBid(id) {
				this.cfg_name = `params&bid=${id}`
				this.init_config_data()
			}
		},
		methods: {
			modifyConfig(value) {
				let title = '';
				switch(value) {
					case 'signup':
						title = '修改报名缴费日期';
						break;
					case 'refund':
						title = '修改退费日期';
						break;
					case 'allow_reg_history':
						title  = '修改是否允许登记历史考勤'
						break
					case 'allow_del_history':
						title  = '修改是否允许撤销历史考勤记录'
						break
					case 'enable_debit_card':
						title = '修改储值相关参数'
						break
					case 'print_bill_type':
						title = '修改缴费打印默认模板'
						break
				}
				this.$Modal.open('system/configs/params/modify-modal.vue',{
					props: {
						data: this.config,
						'cfg-bid': this.cfgBid
					},
					on: {
						save: () => {
							this.init_config_data()
						}
					}
				})
				.then(modal => {
					modal.vuec
					.set('config_id',this.cfg_id)
					.set('modify_type',value)
					.show(title)
				})
			}
		}
	}
</script>