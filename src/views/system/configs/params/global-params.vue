<style lang="less">
	.params-table {
		width: 100%;
		border-collapse: collapse;
		tbody >tr {
			border: 1px solid #e7e7eb;
			padding-left: 10px;
			padding-right: 10px;
			>td {
				height: 60px;
				line-height: 25px;
				padding: 10px 15px;
				&:first-child {
					width: 180px;
				}
				&:nth-child(3n) {
					color: #98999a;
				}
				&:last-child {
					width: 120px;
				}
				p >.config-value{
					margin-left: 10px;
					margin-right: 10px;
					text-decoration: underline; 
				}
			} 
			>th,td {
				&:first-child {
					padding-left: 30px;
				}
				&:last-child {
					padding-left: 30px;
				}
			}
			>th {
				background: #f4f5f9;
				color: #333;
				padding: 10px 15px;
				font-size: 14px;
				>.ivu-icon {
					float: right;
					font-size: 18px;
				}
			}
		}
	}
	.vip-table {
		td {
			padding: 0 !important;
			padding-right: 15px !important;
		}
	}
</style>
<template>
	<div class="c-grid">
		<table class="params-table">
			<tbody>
				<tr>
					<th colspan="4" @click="show('system')">系统相关设置
						<Icon :type="showConfig.system?'chevron-up':'chevron-down'"></Icon>
					</th>
				</tr>
				<template v-if="showConfig.system">
					<tr>
						<td>系统参数</td>
						<td>
							<p>机构名称：{{config.org_name||'-'}}</p>
							<p>机构地址：{{config.address||'-'}}</p>
							<p>联系电话：{{config.mobile||'-'}}</p>
							<p>货币符号: {{config.currency_symbol||this.label_currency}}</p>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('system')">修改</Button></td>
					</tr>
					<tr v-if="is_head_org">
						<td>加盟商系统</td>
						<td>
							<p>
							<Tag :color="config.head.show_contact?'green':'red'">
								{{config.head.show_contact?'是':'否'}}
							</Tag>
							<span>是否显示总部联系方式</span>
							</p>
							<p v-if="config.head.show_contact">
								联系方式：{{config.head.contact||'-'}}
							</p>
						</td>
						<td><p>说明：开启后加盟商市场采单，收据打印底部会有总部联系方式。</p></td>
						<td><Button type="text" size="small" @click="modifyConfig('head')">修改</Button></td>
					</tr>
					<tr>
						<td>课程</td>
						<td>
							<Tag :color="config.class_must_sel_lesson?'green':'red'">
								{{config.class_must_sel_lesson?'是':'否'}}
							</Tag>
							<span>班级是否必须属于课程</span>
						</td>
						<td>说明：开启后创建班级必须选择所属课程</td>
						<td><Button type="text" size="small" @click="modifyConfig('class')">修改</Button></td>
					</tr>
					<tr>
						<td>年级</td>
						<td>
							<Tag :color="config.enable_grade?'green':'red'">{{config.enable_grade?'是':'否'}}</Tag>
							<span>是否启用年级</span>
						</td>
						<td>说明：开启后课程、班级、排课、考勤、课耗等会有年级条件</td>
						<td><Button type="text" size="small" @click="modifyConfig('grade')">修改</Button></td>
					</tr>
					<tr>
						<td>分公司</td>
						<td>
							<Tag :color="config.enable_company?'green':'red'">
								{{config.enable_company?'是':'否'}}
							</Tag>
							<span>部门设置是否启用分公司</span>
						</td>
						<td>说明：开启后可划分分公司</td>
						<td><Button type="text" size="small" @click="modifyConfig('company')">修改</Button></td>
					</tr>
					<tr v-if="is_gm">
						<td>项目</td>
						<td>
							<Tag :color="config.enable_project?'green':'red'">
								{{config.enable_project?'是':'否'}}
							</Tag>
							<span>是否启用项目</span>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('project')">修改</Button></td>
					</tr>
					<tr>
						<td>会员体系</td>
						<td>
							<p>
								<Tag :color="config.member.enable?'green':'red'">
									{{config.member.enable?'是':'否'}}
								</Tag>
								<span>是否启用会员体系</span>
							</p>
							<template v-if="config.member.enable">
								<p>会员名称：{{config.member.name}}</p>
								<table class="vip-table">
									<tr>
										<td>等级</td>
										<td>名称</td>
										<td>累计缴费</td>
										<td>享有折扣</td>
									</tr>
									<tr v-for="(item,index) in config.member.level">
										<td>{{index}}</td>
										<td>{{item.name}}</td>
										<template v-if="index==0">
											<td></td>
											<td></td>
										</template>
										<template v-else>
											<td>{{item.amount}}</td>
											<td>{{item.discount}}</td>
										</template>
									</tr>
								</table>
							</template>
						</td>
						<td style="vertical-align: top">说明：开启后学员拥有会员等级</td>
						<td><Button type="text" size="small" @click="modifyConfig('vip')">修改</Button></td>
					</tr>
					<tr>
						<td>教师星级</td>
						<td>
							<p>
								<Tag :color="config.teacher_level.enable?'green':'red'">
									{{config.teacher_level.enable?'是':'否'}}
								</Tag>
								<span>是否启用教师星级</span>
							</p>
							<template v-if="config.teacher_level.enable">
								
								<table class="vip-table">
									<tr>
										<td>等级</td>
										<td>名称</td>
										
									</tr>
									<tr v-for="(item,index) in config.teacher_level.level">
										<td>{{index}}</td>
										<td>{{item.name}}</td>
										
									</tr>
								</table>
							</template>
						</td>
						<td style="vertical-align: top">说明：开启后可按教师星级来扣课时</td>
						<td><Button type="text" size="small" @click="modifyConfig('teacher_level')">修改</Button></td>
					</tr>
					<tr>
						<td>线上课</td>
						<td>
							<Tag :color="config.enable_online_lesson?'green':'red'">
								{{config.enable_online_lesson?'是':'否'}}
							</Tag>
							<span>设置是否启用线上课</span>
						</td>
						<td>说明：启用线上课以后班级，排课，会有线上课选项，线上课不受跨校区限制</td>
						<td><Button type="text" size="small" @click="modifyConfig('online')">修改</Button></td>
					</tr>
					<tr>
						<td>物品管理</td>
						<td>
							<Tag :color="config.app.enable_material_bid?'green':'red'">
								{{config.app.enable_material_bid?'是':'否'}}
							</Tag>
							<span>物品是否启独立校区管理</span>
						</td>
						<td>说明：启用独立校区管理物品以后，每个校区单独的添加管理自己校区的物品</td>
						<td><Button type="text" size="small" @click="modifyConfig('material')">修改</Button></td>
					</tr>
					<tr>
						<td>自动编号规则</td>
						<td>
							<p>订单编号:<span class="config-value">{{config.student_signup.order_no_rule}}</span></p>
							<p>收据编号:<span class="config-value">{{config.student_signup.order_receipt_bill_no_rule}}</span></p>
							<p>结转单编号:<span class="config-value">{{config.student_signup.order_transfer_no_rule}}</span></p>
							<p>退费单编号:<span class="config-value">{{config.student_signup.order_refund_no_rule}}</span></p>
							<p>学员学号:<span class="config-value">{{config.student_signup.student_no_rule}}</span></p>
						</td>
						<td>
							<p>变量说明:</p>
							<p><code>{Y}</code>4位数年份,比如:2019<code>{y}</code>2位数年份,比如:19
							<code>{m}</code>2位数月份,比如01
							<code>{d}</code>2位数日期,比如11</p> 
							<p><code>{H}</code>2位数小时数,比如 12
							<code>{i}</code>2位数分钟数,比如 01
							<code>{s}</code>2位数毫秒数,比如 01</p> 
							<p><code>{RN3}</code><code>{RN4}</code><code>{RN5}</code>分别表示3位4位5位随机数字</p>
							<p><code>{RW3}</code><code>{RW4}</code><code>{RW5}</code>分别表示3位4位5位随机字母</p>
							<p><code>{BYN4}</code><code>{BYN5}</code><code>{BYN6}</code><code>{BYN7}</code><code>{BYN8}</code>分别表示1年内的该类型的单据在一个校区内的序号，如果数字不足位数，以0补齐，比如BYN4 是4位，但是序号是 12 ，那么获得的值是 0012 </p>
							<p><code>{BYMN3}</code><code>{BYMN4}</code><code>{BYMN5}</code>分别表示1个月内该类型的单据在一个校区里面的序号，如果数字不足位数，以0补齐，比如BYN4 是4位，但是序号是 12，那么获得的值是 0012</p>
							<p><code>{GN3}</code><code>{GN4}</code><code>{GN5}</code><code>{GN6}</code><code>{GN7}</code><code>{GN8}</code><code>{GN9}</code>分别表示4-9位的总序号，不区分校区,如果数字不足位数，以0补齐，比如GN4 是4位，但是序号是 12，那么获得的值是 0012</p>
							<p><code>{BNO}</code> 表示校区编号，校区编号可以在校区设置里面修改设置，如果不设置，默认是校区的ID</p>
						</td>
						<td>
							<p>
							<Button type="text" size="small" @click="modifyConfig('bill_no_rule')">修改</Button>
							</p>
							<p>
							<Button type="text" size="small" @click="showBranchSnoModal">编号序号设置</Button>
							</p>
						</td>
					</tr>
				</template>
			</tbody>
			
			<tbody>
				<tr><th colspan="4" @click="show('customer')">客户相关设置
					<Icon :type="showConfig.customer?'chevron-up':'chevron-down'"></Icon></th>
				</tr>
				<template v-if="showConfig.customer">
					<tr>
						<td>客户公海设置</td>
						<td>
							<p>
								<Tag :color="config.customer.pc_auto_recycle?'green':'red'">
								{{config.customer.pc_auto_recycle?'是':'否'}}
								</Tag>
								<span>是否启用未跟进客户自动回收到客户公海</span>
							</p>
							<template v-if="config.customer.pc_auto_recycle == 1">
								<p>未成交客户<span class="config-value">{{config.customer.pc_un_follow_days}}</span>天未跟进自动划入客户公海</p>
								<p>划入前<span class="config-value">{{config.customer.pc_before_remind_days}}</span>天提醒责任人</p>	
								<p>销售最多可拥有<span class="config-value">{{config.customer.pc_limit_customer_num}}</span>个未成交客户</p>
							</template>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('customer')">修改</Button></td>
					</tr>
					<tr>
						<td>跟进预警设置</td>
						<td>
							<p><span class="config-value">{{config.customer.follow_warning_days}}</span>天未跟进的客户名字变为橙色</p>				
						</td>
						<td style="vertical-align: top">客户划入公海前 {{config.customer.pc_before_remind_days}} 天名字变为红色</td>
						<td><Button type="text" size="small" @click="modifyConfig('follow_warning_days')">修改</Button></td>
					</tr>
					<tr>
						<td>强制选择市场渠道</td>
						<td>
							<Tag :color="config.customer.must_mc_id?'green':'red'">
								{{config.customer.must_mc_id?'是':'否'}}
							</Tag>
							<span>是否强制选择市场渠道</span>
						</td>
						<td>开启后添加客户必须选择市场渠道</td>
						<td><Button type="text" size="small" @click="modifyConfig('customer.must_mc_id')">修改</Button></td>
					</tr>
					<tr>
						<td>强制选择招生来源</td>
						<td>
							<Tag :color="config.customer.must_from_did?'green':'red'">
								{{config.customer.must_from_did?'是':'否'}}
							</Tag>
							<span>是否强制选择招生来源</span>
						</td>
						<td>开启后添加客户必须选择招生来源</td>
						<td><Button type="text" size="small" @click="modifyConfig('customer.must_from_did')">修改</Button></td>
					</tr>
					<tr>
						<td>强制选择意向程度</td>
						<td>
							<Tag :color="config.customer.must_intention_level?'green':'red'">
								{{config.customer.must_intention_level?'是':'否'}}
							</Tag>
							<span>是否强制选择意向程度</span>
						</td>
						<td>开启后添加客户必须选择意向程度</td>
						<td><Button type="text" size="small" @click="modifyConfig('must_intention_level')">修改</Button></td>
					</tr>
					<tr>
						<td>强制选择客户状态</td>
						<td>
							<Tag :color="config.customer.must_customer_status_did?'green':'red'">
								{{config.customer.must_customer_status_did?'是':'否'}}
							</Tag>
							<span>是否强制选择客户状态</span>
						</td>
						<td>开启后添加客户必须选择客户状态</td>
						<td><Button type="text" size="small" @click="modifyConfig('must_customer_status_did')">修改</Button></td>
					</tr>
					<tr>
						<td>是否允许直接录入客户名单</td>
						<td>
							<Tag :color="config.customer.allow_cu_add?'green':'red'">
								{{config.customer.allow_cu_add?'是':'否'}}
							</Tag>
							<span>是否允许从客户名单处添加客户名单或导入名单</span>
						</td>
						<td>开启后可以从客户名单处录入名单</td>
						<td><Button type="text" size="small" @click="modifyConfig('allow_cu_add')">修改</Button></td>
					</tr>
                    <tr>
						<td>市场、客户名单录入约束限制</td>
						<td>
							<Tag :color="config.customer.required_school_grade_from?'green':'red'">
								{{config.customer.required_school_grade_from?'是':'否'}}
							</Tag>
							<span>是否开启市场、客户名单录入约束限制</span>
						</td>
						<td>开启后公立学校，学生年级以及招生来源为必填信息</td>
						<td><Button type="text" size="small" @click="modifyConfig('required_school_grade_from')">修改</Button></td>
					</tr>
				</template>
			</tbody>
			
			<tbody>
				<tr>
					<th colspan="4" @click="show('signup')">费用相关设置
						<Icon :type="showConfig.signup?'chevron-up':'chevron-down'"></Icon>
					</th>
				</tr>
				<template v-if="showConfig.signup">
					<tr>
						<td>报名缴费</td>
						<td>
							<p>
								<Tag :color="config.student_signup.allow_modify_date?'green':'red'">
									{{config.student_signup.allow_modify_date?'是':'否'}}
								</Tag>
								<span>是否允许修改报名缴费日期</span>
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

							<p>缴费默认金额<span class="config-value">{{default_pay_amount}}</span></p>

							<p>保存订单文字:<span class="config-value">{{config.student_signup.save_order_text}}</span>
							</p>
							<p>确认订单文字:<span class="config-value">{{config.student_signup.confirm_order_text}}</span></p>
							<p>
								<Tag :color="config.student_signup.default_aa_empty?'green':'red'">
									{{config.student_signup.default_aa_empty?'是':'否'}}
								</Tag>
								<span>是否收款账号默认为空</span>
							</p>
						</td>
						<td>说明：不在允许天数之内或允许月数之内的不能报名缴费，若同时设置了天数与月份，则优先使用天数规则</td>
						<td><Button type="text" size="small" @click="modifyConfig('signup')">修改</Button></td>
					</tr>
					<tr>
						<td>收费类型</td>
						<td>
							<p>
								<Tag :color="config.student_signup.empty_oi_consume_type?'green':'red'">
									{{config.student_signup.empty_oi_consume_type?'是':'否'}}
								</Tag>
								<span>无报名记录的学员缴费是否默认为新报</span>
							</p>
							<p>
								启用的收费类型:
								<span v-for="(item,index) in config.student_signup.consume_types">
									<em class="config-value" v-if="item.enable">
										{{item.label}}
									</em>
								</span>
							</p>
							
						</td>
						<td>说明：初期使用系统时由于没有数据无法判断新录入的学员缴费时新报还是续费，可设置为否</td>
						<td><Button type="text" size="small" @click="modifyConfig('consume_type')">修改</Button></td>
					</tr>
					<tr>
						<td>退费参数</td>
						<td>
							<p>
								<Tag :color="config.student_refund.allow_modify_date?'green':'red'">
									{{config.student_refund.allow_modify_date?'是':'否'}}
								</Tag>
								<span>是否允许修改退费日期</span>
							</p>
							<p v-if="config.student_refund.allow_modify_date">							
								<template v-if="config.student_refund.modify_date_months > 0">
									<p>按月份：
										<span class="config-value">{{map_history_pass_months[config.student_refund.modify_date_months]}}</span>
									</p>
								</template>							
								<p v-if="config.student_refund.modify_date_days > 0">
									按天数：允许<span class="config-value">{{config.student_refund.modify_date_days}}</span>天
								</p>
								<span v-else>按天数：不限制</span>
							</p>
							<p>
								<Tag :color="config.student_refund.enable_empty_refund?'green':'red'">
									{{config.student_refund.enable_empty_refund?'是':'否'}}
								</Tag>
								<span>是否启用课耗满额退费</span>
							</p>
						</td>
						<td>说明：不在允许天数之内或允许月数之内的不能退费，若同时设置了天数与月份，则优先使用天数规则</td>
						<td><Button type="text" size="small" @click="modifyConfig('refund')">修改</Button></td>
					</tr>
					<tr>
						<td>默认业绩归属人销售角色</td>
						<td>
							<p>新生报名：{{config.default_sale_role_did.new|dict_title('sale_role','-')}}</p>
							<p>老生续报：{{config.default_sale_role_did.renew|dict_title('sale_role','-')}}</p>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('sale_role')">修改</Button></td>
					</tr>
					<tr>
						<td>自定义合同号</td>
						<td>
							<Tag :color="config.student_signup.enable_user_contract_no?'green':'red'">
								{{config.student_signup.enable_user_contract_no?'是':'否'}}
							</Tag>
							<span>是否启用自定义合同号</span>
						</td>
						<td>开启后报名缴费可自定义合同号，合同号即订单编号，不填则系统生成</td>
						<td><Button type="text" size="small" @click="modifyConfig('enable_user_contract_no')">修改</Button></td>
					</tr>
					<tr>
						<td>自定义收据号</td>
						<td>
							<Tag :color="config.student_signup.enable_user_receipt_no?'green':'red'">
								{{config.student_signup.enable_user_receipt_no?'是':'否'}}
							</Tag>
							<span>是否启用自定义收据号</span>
						</td>
						<td>开启后报名缴费可自定义收据号</td>
						<td><Button type="text" size="small" @click="modifyConfig('enable_user_receipt_no')">修改</Button></td>
					</tr>
					
					<tr>
						<td>修改已保存订单</td>
						<td>
							<Tag :color="config.student_signup.enable_modify_saved_order?'green':'red'">
								{{config.student_signup.enable_modify_saved_order?'是':'否'}}
							</Tag>
							<span>是否允许修改已保存订单</span>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('enable_modify_saved_order')">修改</Button></td>
					</tr>
					<tr>
						<td>强制选择招生来源</td>
						<td>
							<Tag :color="config.student_signup.must_from_did?'green':'red'">
								{{config.student_signup.must_from_did?'是':'否'}}
							</Tag>
							<span>是否强制选择招生来源</span>
						</td>
						<td>开启后创建学员档案(新生报名)必须选择招生来源</td>
						<td><Button type="text" size="small" @click="modifyConfig('student_signup.must_from_did')">修改</Button></td>
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
							<p>储值协议默认有效月数:<span class="config-value">{{config.student_signup.precharge_contract_month}}</span> 个月</p>
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
					<tr>
						<td>合同打印</td>
						<td>
							<Tag :color="config.student_signup.enable_contract_print?'green':'red'">
								{{config.student_signup.enable_contract_print?'是':'否'}}
							</Tag>
							<span>是否启用合同打印</span>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('enable_contract_print')">修改</Button></td>
					</tr>
					<tr>
						<td>INVOICE打印</td>
						<td>
							<Tag :color="config.student_signup.enable_invoice_print?'green':'red'">
								{{config.student_signup.enable_invoice_print?'是':'否'}}
							</Tag>
							<span>是否启用INVOICE打印</span>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('enable_invoice_print')">修改</Button></td>
					</tr>
					<tr>
						<td>财务审核</td>
						<td>
							<p>
								<Tag :color="config.iae.enable_order_check?'green':'red'">
									{{config.iae.enable_order_check?'是':'否'}}
								</Tag>
								<span>是否开启订单审核</span>
							</p>
							<p>
								<Tag :color="config.iae.forbid_uncheck_arrange?'green':'red'">
									{{config.iae.forbid_uncheck_arrange?'是':'否'}}
								</Tag>
								<span>是否禁止未审核订单课时排课</span>
							</p>
							<p>
								<Tag :color="config.iae.forbid_uncheck_assign?'green':'red'">
									{{config.iae.forbid_uncheck_assign?'是':'否'}}
								</Tag>
								<span>是否禁止未审核订单课时分班</span>
							</p>
							<p>
								<Tag :color="config.iae.enable_orb_check?'green':'red'">
									{{config.iae.enable_orb_check?'是':'否'}}
								</Tag>
								<span>是否开启缴费审核</span>
							</p>
							<p>
								<Tag :color="config.iae.enable_tally_check?'green':'red'">
									{{config.iae.enable_tally_check?'是':'否'}}
								</Tag>
								<span>是否开启收支流水审核</span>
							</p>
						</td>
						<td>
							<p>开启后订单操作会多出审核操作及审核状态列</p>
							<p>禁止后，未审核的订单课时不允许排课</p>
							<p>禁止后，未审核的订单课时不允许分班</p>
							<p>开启后，缴费记录操作会多出审核操作及审核状态列</p>
							<p>开启后，流水记录会多出审核操作及审核状态列</p>
						</td>
						<td><Button type="text" size="small" @click="modifyConfig('enable_iae_check')">修改</Button></td>
					</tr>
					<tr>
						<td>业绩记录</td>
						<td>
							<Tag :color="config.iae.enable_er_lesson_hour?'green':'red'">
								{{config.iae.enable_er_lesson_hour?'是':'否'}}
							</Tag>
							<span>是否统计课时数</span>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('enable_er_lesson_hour')">修改</Button></td>
					</tr>
					<tr>
						<td>课时排课</td>
						<td>
							<p>
								<Tag :color="config.student_signup.need_lha?'green':'red'">
									{{config.student_signup.need_lha?'是':'否'}}
								</Tag>
								<span>是否启用缴费时安排学员课时排课</span>
							</p>
							<p v-if="config.student_signup.need_lha">
								<Tag :color="config.student_signup.must_input_lha?'green':'red'">
									{{config.student_signup.must_input_lha?'是':'否'}}
								</Tag>
								<span>是否必须在缴费时安排好课时排课</span>
							</p>
						</td>
						<td>说明：在报名缴费的同时，选择老师时间段安排上课（针对先排课再安排学员上课）</td>
						<td><Button type="text" size="small" @click="modifyConfig('need_lha')">修改</Button></td>
					</tr>
					<tr>
						<td>课时扣除</td>
						<td>
							<Tag :color="config.student_signup.auto_reduce_debit_consume?'green':'red'">
								{{config.student_signup.auto_reduce_debit_consume?'是':'否'}}
							</Tag>
							<span>缴费时是否自动扣除未扣课时课耗</span>
						</td>
						<td>开启后，负课时课耗记录的扣课状态会自动转为已扣</td>
						<td><Button type="text" size="small" @click="modifyConfig('auto_reduce_debit_consume')">修改</Button></td>
					</tr>
				</template>
			</tbody>
			
			<tbody>
				<tr>
					<th colspan="4" @click="show('arrange')">排课相关设置
						<Icon :type="showConfig.arrange?'chevron-up':'chevron-down'"></Icon>
					</th>
				</tr>
				<template v-if="showConfig.arrange">
					<tr>
						<td>排课功能</td>
						<td>
							<Tag :color="config.course_arrange.enable_time_section?'green':'red'">
								{{config.course_arrange.enable_time_section?'是':'否'}}
							</Tag>
							<span>是否启用标准上课时间段</span>
						</td>
						<td style="vertical-align: top">说明：禁用后，可视化排课模式将关闭，表格排课模式可自由添加排课时段排课</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('course_arrange_func')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>冲突检测</td>
						<td>
							<!--<div class="mb-2">
								<span>是否忽略1对1排课教室冲突</span>
								<Tag :color="config.course_arrange.ignore_1by1_cc?'green':'red'">
									{{config.course_arrange.ignore_1by1_cc?'是':'否'}}
								</Tag>
							</div>-->
							<div class="mb-2">
								<Tag :color="config.course_arrange.ignore_class_cc?'green':'red'">
									{{config.course_arrange.ignore_class_cc?'是':'否'}}
								</Tag>
								<span>是否忽略排课教室冲突</span>
							</div>
							<div>
								<Tag :color="config.course_arrange.ignore_class_ec?'green':'red'">
									{{config.course_arrange.ignore_class_ec?'是':'否'}}
								</Tag>
								<span>是否忽略排课教师冲突</span>
							</div>
							<div>
								<Tag :color="config.course_arrange.ignore_student_cc?'green':'red'">
									{{config.course_arrange.ignore_student_cc?'是':'否'}}
								</Tag>
								<span>是否忽略学员排课冲突</span>
							</div>
						</td>
						<td style="vertical-align: top">说明：开启后，排课时会根据此配置忽略教室/老师冲突，在添加排课时也可以再次修改，最终以排课时的选择为准</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('ignore')">修改</Button>
						</td>
					</tr>				
					<tr>
						<td>排课限制</td>
						<td>
							<p>
								<Tag :color="config.course_arrange.allow_empty_teachobj?'green':'red'">
									{{config.course_arrange.allow_empty_teachobj?'是':'否'}}
								</Tag>
								<span>是否允许授课对象为空</span>
							</p>
							<p>
								<Tag :color="config.course_arrange.allow_empty_cc?'green':'red'">
									{{config.course_arrange.allow_empty_cc?'是':'否'}}
								</Tag>
								<span>是否允许教室为空</span>
							</p>
							<p>
								<Tag :color="config.course_arrange.allow_passed_arrange?'green':'red'">
									{{config.course_arrange.allow_passed_arrange?'是':'否'}}
								</Tag>
								<span>是否允许过期排课</span>
							</p>
							<p>
								<Tag :color="config.course_arrange.select_teacher_limit?'green':'red'">
									{{config.course_arrange.select_teacher_limit?'是':'否'}}
								</Tag>
								<span>是否限制选择本校区的老师</span>
							</p>
							<p>
								1对多排课默认限制人数：<span class="config-value">{{config.course_arrange.multi_lesson_limit_student}}</span>人
							</p>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('allow_passed_arrange')">修改</Button></td>
					</tr>
					<tr>
						<td>移动端调课限制</td>
						<td>
							<Tag :color="config.course_arrange.allow_mobile_change?'green':'red'">
								{{config.course_arrange.allow_mobile_change?'是':'否'}}
							</Tag>
							<span>是否允许移动端调课</span>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('allow_mobile_change')">修改</Button></td>
					</tr>
					<tr>
						<td>授课内容</td>
						<td>
							<Tag :color="config.course_arrange.enable_tbs?'green':'red'">
								{{config.course_arrange.enable_tbs?'是':'否'}}
							</Tag>
							<span>是否启用授课内容设定</span>
						</td>
						<td>说明：启用时单次排课和可视化排课会显示授课内容</td>
						<td><Button type="text" size="small" @click="modifyConfig('enable_tbs')">修改</Button></td>
					</tr>
					<tr>
						<td>课程预约</td>
						<td>
							<Tag :color="config.course_arrange.is_bk_open?'green':'red'">
								{{config.course_arrange.is_bk_open?'是':'否'}}
							</Tag>
							<span>是否启用课程预约</span>
						</td>
						<td>说明：启用时可以线上约课</td>
						<td><Button type="text" size="small" @click="modifyConfig('is_bk_open')">修改</Button></td>
					</tr>
					<tr>
						<td>排课预警</td>
						<td>
							<p>
								排课预警策略：
								<span v-if="config.dashboard.arrange_warn_policy == 0">按班级排课预警</span>
								<span v-if="config.dashboard.arrange_warn_policy == 1">按老师排课预警</span>
							</p>
						</td>
						<td>说明：策略设置影响工作台的排课预警数据显示</td>
						<td><Button type="text" size="small" @click="modifyConfig('arrange_warn_policy')">修改</Button></td>
					</tr>
					<tr v-if="is_gm">
						<td>排课状态</td>
						<td>
							<Tag :color="config.course_arrange.enable_arrange_status?'green':'red'">
								{{config.course_arrange.enable_arrange_status?'是':'否'}}
							</Tag>
							<span>是否启用1对多/1对1排课状态</span>
						</td>
						<td>说明：启用时可以显示已安排多少课时</td>
						<td><Button type="text" size="small" @click="modifyConfig('enable_arrange_status')">修改</Button></td>
					</tr>
					<tr v-if="is_gm">
						<td>排课表</td>
						<td>
							<Tag :color="config.course_arrange.show_student_grade?'green':'red'">
								{{config.course_arrange.show_student_grade?'是':'否'}}
							</Tag>
							<span>是否在排课表显示学员年级</span>
						</td>
						<td>说明：启用后可在排课表显示学员年级</td>
						<td><Button type="text" size="small" @click="modifyConfig('show_student_grade')">修改</Button></td>
					</tr>
				</template>
			</tbody>
			
			<tbody>
				<tr>
					<th colspan="4" @click="show('attendance')">考勤相关设置
						<Icon :type="showConfig.attendance?'chevron-up':'chevron-down'"></Icon>
					</th>
				</tr>
				<template v-if="showConfig.attendance">
					<tr>
						<td>默认课时定义</td>
						<td>
							<p>一个课时价格<span class="config-value">{{config.per_lesson_hour_price}}</span>元</p>
							<p>单课时分钟数<span class="config-value">{{config.per_lesson_hour_minutes}}</span>分钟</p>
							<p>
								<Tag :color="config.ignore_time_long_clh?'green':'red'">
									{{config.ignore_time_long_clh?'是':'否'}}
								</Tag>
								<span>是否忽略课时长度与扣课时关系</span>
							</p>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('hour')">修改</Button></td>
					</tr>
					<tr>
						<td>课前提醒</td>
						<td>
							<p>课前提醒页面默认筛选<span class="config-value">{{remind_before}}</span>上课的学员</p>
							<p>
								<Tag :color="config.service.remind_push_policy?'green':'red'">
									{{config.service.remind_push_policy?'是':'否'}}
								</Tag>
								<span>同一学员同一天有多次课是否分多条推送</span>
							</p>
						</td>
						<td valign="bottom">
							<p>说明：开启后同一天多次课分多条推送，关闭后一天的课合并只推送一条</p>
						</td>
						<td><Button type="text" size="small" @click="modifyConfig('remind_before')">修改</Button></td>
					</tr>
					<tr>
						<td>考勤审核</td>
						<td>
							<Tag :color="config.class_attendance.enable_attendance_check?'green':'red'">
								{{config.class_attendance.enable_attendance_check?'是':'否'}}
							</Tag>
							<span>是否开启1对1考勤审核</span>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('enable_attendance_check')">修改</Button></td>
					</tr>
					<tr>
						<td>登记当天考勤</td>
						<td>
							<p>上课前<span class="config-value">{{config.class_attendance.reg_att_before_min}}</span>分钟内可以考勤</p>
						</td>
						<td>说明：如上课时间为08:00 ~ 10:00，设置为10分钟，那么在 07:50 后才可以考勤</td>
						<td><Button type="text" size="small" @click="modifyConfig('reg_att_before_min')">修改</Button></td>
					</tr>
					<tr>
						<td>登记历史考勤</td>
						<td>
							<p>
								<Tag :color="config.class_attendance.allow_reg_history?'green':'red'">
									{{config.class_attendance.allow_reg_history?'是':'否'}}
								</Tag>
								<span>是否允许登记历史考勤</span>
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
								<Tag :color="config.class_attendance.allow_del_history?'green':'red'">
									{{config.class_attendance.allow_del_history?'是':'否'}}
								</Tag>
								<span>是否允许撤销历史考勤记录</span>
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
					<tr>
						<td>考勤登记</td>
						<td>
							<p>上课前<span class="config-value">{{config.class_attendance.min_before_class}}</span>分钟内可以考勤</p>
							<p>下课后<span class="config-value">{{config.class_attendance.min_after_class}}</span>分钟内可以考勤</p>
							<p>
								<Tag :color="config.class_attendance.allow_debt_att?'green':'red'">
									{{config.class_attendance.allow_debt_att?'是':'否'}}
								</Tag>
								<span>是否允许负课时考勤</span>
							</p>
							<p>
								<Tag :color="config.class_attendance.allow_modify_consume_hour?'green':'red'">
									{{config.class_attendance.allow_modify_consume_hour?'是':'否'}}
								</Tag>
								<span>是否允许修改课时消耗数</span>
							</p>
							<p>
								<Tag :color="config.class_attendance.show_expire_day?'green':'red'">
									{{config.class_attendance.show_expire_day?'是':'否'}}
								</Tag>
								<span>是否显示剩余课时有效期</span>
							</p>
						</td>
						<td style="vertical-align: bottom;">
							<p>说明：开启后学员剩余课时不足时仍可以考勤</p>
							<p>说明：开启后可在考勤登记界面查看剩余课时有效期</p>
						</td>
						<td><Button type="text" size="small" @click="modifyConfig('attend')">修改</Button></td>
					</tr>
					<tr>
						<td>刷卡设置</td>
						<td>
							<p v-if="is_gm">
								<Tag :color="config.class_attendance.enable_qrcode_attendance?'green':'red'">
									{{config.class_attendance.enable_qrcode_attendance?'是':'否'}}
								</Tag>
								<span>是否启用二维码扫码考勤</span>
							</p>
							<p>
								刷卡通知策略:
								<span v-if="config.class_attendance.swipe_card_notify_mode == 0">不发任何通知</span>
								<span v-if="config.class_attendance.swipe_card_notify_mode == 1">只发考勤通知</span>
								<span v-if="config.class_attendance.swipe_card_notify_mode == 2">只发到离校通知</span>
								<span v-if="config.class_attendance.swipe_card_notify_mode == 3">既发到离校通知也发考勤通知</span>
							</p>	

							<p>
								<Tag :color="config.class_attendance.print_attendance_bill?'green':'red'">
									{{config.class_attendance.print_attendance_bill?'是':'否'}}
								</Tag>
								<span>刷卡考勤是否出小票</span>
							</p>
							<p>
								刷卡考勤扣课时策略:
								<span v-if="config.class_attendance.swipe_card_consume_mode == 0">上一次课刷一次卡</span>
								<span v-if="config.class_attendance.swipe_card_consume_mode == 1">刷一次卡扣一天所有课时</span>
								
							</p>						
						</td>
						<td style="vertical-align: bottom;"></td>
						<td><Button type="text" size="small" @click="modifyConfig('swipe')">修改</Button></td>
					</tr>
					<tr>
						<td>学员请假</td>
						<td>
							<p>
								<Tag :color="config.student_leave.enable?'green':'red'">
									{{config.student_leave.enable?'是':'否'}}
								</Tag>
								<span>是否允许请假</span>
							</p>
							<template v-if="config.student_leave.enable">
								<p>至少提前
									<span class="config-value">{{student_leave_value}}
									</span>{{student_leave_unit=='day'?'天':'分钟'}}
								</p>
								<p v-if="config.student_leave.times_limit==0">不限制请假次数</p>
								<p v-else>允许请假<span class="config-value">{{config.student_leave.times_limit}}</span>次</p>
								<p v-if="config.student_leave.limit_policy==0">请假限制策略：按课时 <br/>允许请假: 
									<span class="config-value" v-if="config.student_leave.times_limit==0" >不限制请假次数</span>
									<span class="config-value" v-else>{{config.student_leave.times_limit}}</span>次
								</p>
								<p v-if="config.student_leave.limit_policy==1">请假限制策略：按月 <br/>允许请假: 
									<span class="config-value"  v-if="config.student_leave.month_limit_num==0" >不限制请假次数</span>
									<span class="config-value"  v-else>{{config.student_leave.month_limit_num}}</span>次 
								</p>
								<!-- <RadioGroup v-model="config.student_leave.limit_policy">
										<Radio :label="0">按课时</Radio>
										<Radio :label="1">按月份</Radio>
								</RadioGroup> -->

									<!-- 请假限制策略:
									<RadioGroup v-model="config.student_leave.limit_policy">
											<Radio :label="0">按课时</Radio>
											<Radio :label="1">按月份</Radio>
									</RadioGroup> -->


								<!-- <p v-if="config.student_leave.limit_policy==0">按课时</p> -->
								
							</template>
							<p>
								<Tag :color="config.student_leave.regatt_default_consume?'green':'red'">
									{{config.student_leave.regatt_default_consume?'是':'否'}}
								</Tag>
								<span>请假是否默认勾选扣课时</span>
							</p>
						</td>
						<td>说明：1.学员通过学习管家请假; 2.同一课程允许请假的次数限制, 0表示不限制</td>
						<td><Button type="text" size="small" @click="modifyConfig('leave')">修改</Button></td>
					</tr>
					<tr>
						<td>请假预警</td>
						<td>
							<p>预警请假<span class="config-value">{{config.leave_warn_times}}</span>次以上的学员</p>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('leave_warn_times')">修改</Button></td>
					</tr>
					<tr>
						<td>学员补课/排课</td>
						<td>
							<p>
								<Tag :color="config.student_makeup.allow_different_lesson?'green':'red'">
									{{config.student_makeup.allow_different_lesson?'是':'否'}}
								</Tag>
								<span>是否允许不同课程学员同班补课或一对多学员排课</span>
							</p>
							
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('allow_different_lesson')">修改</Button></td>
					</tr>
					<tr>
						<td>课时预警</td>
						<td>
							<p>预警剩余课时<span class="config-value">{{config.lesson_warn_nums}}</span>次以下的学员</p>
							<p>预警模式：<span class="config-value" v-if="config.lesson_warn_mode == 0">按学员单课程剩余课时来预警</span>
								<span class="config-value" v-if="config.lesson_warn_mode == 1">按学员剩余总课时来预警</span>
							</p>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('lesson_warn_nums')">修改</Button></td>
					</tr>
					
					<tr>
						<td>有效期预警</td>
						<td>
							<p>预警有效期<span class="config-value">{{config.lesson_warn_days}}</span>天以下的学员</p>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('lesson_warn_days')">修改</Button></td>
					</tr>
					<tr>
						<td>赠送课时消耗规则</td>
						<td>
							<p>{{present_consume_rule}}</p>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('present_consume_rule')">修改</Button></td>
					</tr>
					<tr>
						<td>额外课消</td>
						<td>
							<p>
								<Tag :color="config.class_attendance.enable_extra_consume?'green':'red'">
									{{config.class_attendance.enable_extra_consume?'是':'否'}}
								</Tag>
								<span>是否开启额外课消</span>
							</p>
						</td>
						<td>说明：开启后在考勤界面可设置额外课消</td>
						<td><Button type="text" size="small" @click="modifyConfig('enable_extra_consume')">修改</Button></td>
					</tr>
					
					<tr>
						<td>余额课消</td>
						<td>
							<p>
								<Tag :color="config.class_attendance.enable_money_consume?'green':'red'">
									{{config.class_attendance.enable_money_consume?'是':'否'}}
								</Tag>
								<span>是否开启考勤扣钱包余额</span>
							</p>
						</td>
						<td>说明：开启后考勤时可以直接扣减学员余额</td>
						<td><Button type="text" size="small" @click="modifyConfig('enable_money_consume')">修改</Button></td>
					</tr>

					<tr>
						<td>课时按科目通用</td>
						<td>
							<p>
								<Tag :color="config.class_attendance.sl_bcu_subject?'green':'red'">
									{{config.class_attendance.sl_bcu_subject?'是':'否'}}
								</Tag>
								<span>是否开启课时按科目通用</span>
							</p>
							<p>
								<Tag :color="config.class_attendance.is_clh_locked?'green':'red'">
									{{config.class_attendance.is_clh_locked?'是':'否'}}
								</Tag>
								<span>是否锁定班级课时</span>
							</p>
						</td>
						<td>
							<p>说明：开启后相同科目的课时可以通用</p>
							<p>说明：开启后锁定班级课时后，指定班级的课时只能在本班级使用，即使其他班级相同科目也无法使用</p>
						</td>
						<td><Button type="text" size="small" @click="modifyConfig('sl_bcu_subject')">修改</Button></td>
					</tr>

					<tr>
						<td>自由考勤</td>
						<td>
							<p>
								<Tag :color="config.class_attendance.enable_free_attendance?'green':'red'">
									{{config.class_attendance.enable_free_attendance?'是':'否'}}
								</Tag>
								<span>是否允许自由登记考勤</span>
							</p>
							
						</td>
						<td>
							<p>说明：开启后可以不排课直接登记考勤</p>
							
						</td>
						<td><Button type="text" size="small" @click="modifyConfig('free_attendance')">修改</Button></td>
					</tr>

					<tr>
						<td>授课记录</td>
						<td>
							<p>
								呈现方式：
								<span class="config-value" v-if="config.class_attendance.list_mode == 0">只显示考勤相关(默认)</span>
								<span class="config-value" v-if="config.class_attendance.list_mode == 1">考勤+课耗</span>
							</p>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('class_attendance_list_mode')">修改</Button></td>
					</tr>

				</template>
			</tbody>
			
			<tbody>
				<tr>
					<th colspan="4" @click="show('studentmobile')">学习管家设置
						<Icon :type="showConfig.studentmobile?'chevron-up':'chevron-down'"></Icon>
					</th>
				</tr>
				<template v-if="showConfig.studentmobile">
					
					<tr>
						<td>学习管家密码</td>
						<td>
							<p>
								默认密码
								<span class="config-value">
									<span v-if="config.service.default_sm_pwd_type==5">{{config.service.default_sm_pwd}}</span>
									<span v-else>{{config.service.default_sm_pwd_type|sm_pw}}</span>
								</span>					
							</p>
						</td>
						<td>说明：自定义学习管家登录密码</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('default_sm_pwd_type')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>移动端课时</td>
						<td>
							<p>
								<Tag :color="config.xxgj.hide_student_lesson?'green':'red'">
									{{config.xxgj.hide_student_lesson?'是':'否'}}
								</Tag>
								<span>是否隐藏学员课时</span>				
							</p>
						</td>
						<td>说明：若开启此设置，家长将看不到学员课时使用情况</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('xxgj')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>订单金额</td>
						<td>
							<p>
								<Tag :color="config.xxgj.hide_order_amount?'green':'red'">
									{{config.xxgj.hide_order_amount?'是':'否'}}
								</Tag>
								<span>是否隐藏订单金额</span>				
							</p>
						</td>
						<td>说明：若开启此设置，家长将看不到学员订单金额</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('xxgj')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>课程名称</td>
						<td>
							<p>
								<Tag :color="config.xxgj.class_show_lesson_name?'green':'red'">
									{{config.xxgj.class_show_lesson_name ?'是':'否'}}
								</Tag>
								<span>班级是否显示课程名称</span>				
							</p>
						</td>
						<td>说明：若设置为否，学习管家班级将看不到所属课程名称</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('xxgj')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>考勤展示</td>
						<td>
							<p>
								<Tag :color="config.xxgj.show_comb_student_attendance?'green':'red'">
									{{config.xxgj.show_comb_student_attendance?'是':'否'}}
								</Tag>
								<span>是否在考勤应用显示汇总课时</span>				
							</p>
							<p>
								<Tag :color="config.xxgj.show_consume_lesson_hours?'green':'red'">
									{{config.xxgj.show_consume_lesson_hours?'是':'否'}}
								</Tag>
								<span>是否在考勤应用考勤记录显示扣课时数</span>				
							</p>
							
						</td>
						<td>说明：若开启"在考勤应用显示汇总课时"设置，在考勤应用顶部会汇总显示当月考勤所消耗的课时数</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('xxgj')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>活动课预约</td>
						<td>
							<p>
								<Tag :color="config.xxgj.enable_type0_bk?'green':'red'">
									{{config.xxgj.enable_type0_bk?'是':'否'}}
								</Tag>
								<span>是否启用班课活动课预约</span>				
							</p>
							<p>
								<Tag :color="config.xxgj.enable_type2_bk?'green':'red'">
									{{config.xxgj.enable_type2_bk?'是':'否'}}
								</Tag>
								<span>是否启用1对多活动课预约</span>				
							</p>
							<p>
								1对多活动课Tab名称
								<span class="config-value">
									<span>{{config.xxgj.type2_tab_title}}</span>
								</span>					
							</p>
							<p>
								班课活动课Tab名称
								<span class="config-value">
									<span>{{config.xxgj.type0_tab_title}}</span>
								</span>					
							</p>
						</td>
						<td>说明：启用班课活动课预约需要创建活动课类型的临时课班级,启用1对多活动课预约需要在排课计划 创建 按科目的排课计划</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('bk')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>教室直播</td>
						<td>
							<p>
								<Tag :color="config.xxgj.enable_classroom_live?'green':'red'">
									{{config.xxgj.enable_classroom_live?'是':'否'}}
								</Tag>
								<span>是否启用教室直播</span>				
							</p>
						</td>
						<td>说明：开启后，家长可以在手机端观看教室直播</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('enable_classroom_live')">修改</Button>
						</td>
					</tr>
				</template>
			</tbody>

			<tbody>
				<tr>
					<th colspan="4" @click="show('orgmobile')">教育助手设置
						<Icon :type="showConfig.orgmobile?'chevron-up':'chevron-down'"></Icon>
					</th>
				</tr>
				<template v-if="showConfig.orgmobile">
					<tr>
						<td>学生回评</td>
						<td>
							<p>
								<Tag :color="config.jyzs.hide_student_review?'green':'red'">
									{{config.jyzs.hide_student_review?'是':'否'}}
								</Tag>
								<span>是否隐藏学员对老师的回评</span>				
							</p>
						</td>
						<td>说明：若开启此设置，老师将看不到学员对老师的回评</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('hide_student_review')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>登记考勤</td>
						<td>
							<p>
								<Tag :color="config.jyzs.disable_attendance?'green':'red'">
									{{config.jyzs.disable_attendance?'是':'否'}}
								</Tag>
								<span>是否禁止移动端考勤</span>				
							</p>
						</td>
						<td>说明：若禁用移动端不能考勤</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('disable_attendance')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>自由考勤</td>
						<td>
							<p>
								<Tag :color="config.jyzs.enable_free_attendance?'green':'red'">
									{{config.jyzs.enable_free_attendance?'是':'否'}}
								</Tag>
								<span>是否开启自由考勤</span>				
							</p>
						</td>
						<td>说明：若开启此设置，老师端可自由登记考勤</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('enable_free_attendance')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>考勤撤销</td>
						<td>
							<p>
								<Tag :color="config.jyzs.enable_cancel_attendance?'green':'red'">
									{{config.jyzs.enable_cancel_attendance?'是':'否'}}
								</Tag>
								<span>已登记的考勤是否允许撤销</span>				
							</p>
						</td>
						<td>说明：若开启此设置，老师点名考勤以后还可以进行撤销</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('enable_cancel_attendance')">修改</Button>
						</td>
					</tr>
					<tr v-if="is_gm">
						<td>兼职老师</td>
						<td>
							<p>
								<Tag :color="config.jyzs.pj_employee_hide_student?'green':'red'">
									{{config.jyzs.pj_employee_hide_student?'是':'否'}}
								</Tag>
								<span>是否隐藏学员菜单</span>				
							</p>
							<p>
								<Tag :color="config.jyzs.pj_employee_forbid_cc?'green':'red'">
									{{config.jyzs.pj_employee_forbid_cc?'是':'否'}}
								</Tag>
								<span>是否禁止调课</span>				
							</p>
						</td>
						<td>说明：若开启此设置，兼职老师将看不到学员菜单</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('jyzs')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>调课</td>
						<td>
							<p>
								<Tag :color="config.jyzs.allow_free_hour_section?'green':'red'">
									{{config.jyzs.allow_free_hour_section?'是':'否'}}
								</Tag>
								<span>是否允许调课自由输入时间段</span>				
							</p>
						</td>
						<td>说明：开启后，增加自由输入时间段的选项</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('allow_free_hour_section')">修改</Button>
						</td>
					</tr>
					<tr v-if="is_gm">
						<td>周期服务</td>
						<td>
							<p>
								<Tag :color="config.service.enable_service_remind_push?'green':'red'">
									{{config.service.enable_service_remind_push?'是':'否'}}
								</Tag>
								<span>是否考勤时自动推送周期服务提醒模板消息</span>				
							</p>
						</td>
						<td>说明：开启后，考勤登记时会根据周期服务规则自动判断推送提醒相关人员</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('enable_service_remind_push')">修改</Button>
						</td>
					</tr>
				</template>
			</tbody>

			<tbody>
				<tr>
					<th colspan="4" @click="show('other')">其他
						<Icon :type="showConfig.other?'chevron-up':'chevron-down'"></Icon>
					</th>
				</tr>
				<template v-if="showConfig.other">
					<tr>
						<td>学员回访</td>
						<td>
							<p>显示请假<span class="config-value">{{config.return_visit.ask_leave_times}}</span>次以上的学员</p>
							<p>显示缺勤<span class="config-value">{{config.return_visit.absence_times}}</span>次以上的学员</p>
							<p>显示未交作业<span class="config-value">{{config.return_visit.not_hand_in_homework_times}}</span>次以上的学员</p>
							<template v-if="config.return_visit.student_lesson_remain_times">
				    			<p>显示剩余课次总量
				    				<span class="config-value">{{config.return_visit.student_lesson_remain_times}}</span>
					    		</p>
			    			</template>
			    			<template v-else>
			    				<p>显示剩余课次百分比
					    			<span class="config-value">{{getRate()}}</span>
					    			<span class="mr-3">%</span>	
				    			</p>		    			
			    			</template>
						</td>
						<td></td>
						<td><Button type="text" size="small" @click="modifyConfig('return_visit')">修改</Button></td>
					</tr>
					<tr>
						<td>学员回评</td>
						<td>
							<p>
								<Tag :color="config.service.auto_reply_review?'green':'red'">
									{{config.service.auto_reply_review?'是':'否'}}
								</Tag>
								<span>是否开启学员自动回评</span>
							</p>
							<template v-if="config.service.auto_reply_review == 1">
								<p>超过<span class="config-value">{{config.service.auto_reply_review_dd}}</span>天未回评自动回评</p>
								<p>回评打星:<span class="config-value">{{config.service.auto_reply_review_star}}</span>星</p>
								<p>回评内容:<span class="config-value">{{config.service.auto_reply_review_text}}</span></p>
							</template>

						</td>
						<td>说明：开启学员自动回评后，学员会自动根据设定的参数超过设定日期对教师课评进行星级回评。</td>
						<td><Button type="text" size="small" @click="modifyConfig('auto_reply_review')">修改</Button></td>
					</tr>
					<tr>
						<td>课后作业</td>
						<td>
							<p>
								<Tag :color="config.service.enable_homework_star?'green':'red'">
									{{config.service.enable_homework_star?'是':'否'}}
								</Tag>
								<span>是否开启作业星级</span>
							</p>
							<p>
								<Tag :color="config.service.enable_homework_task_tpl?'green':'red'">
									{{config.service.enable_homework_task_tpl?'是':'否'}}
								</Tag>
								<span>是否可以自由选择作业模板</span>
							</p>
							<p>
								<Tag :color="config.service.enable_regular_homework?'green':'red'">
									{{config.service.enable_regular_homework?'是':'否'}}
								</Tag>
								<span>是否启用打卡作业</span>
							</p>
						</td>   
						<td style="vertical-align: top">
							<p>说明：开启后即使用作业精批模式，学员可自主选择作业星级（不同星级代表不同的作业难度）</p>
							<p>说明：开启后可在布置作业时自由选择作业模板</p>
							<p>说明：开启后可以布置打卡作业</p>
						</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('service')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>服务星级</td>
						<td>
							<p>
								<Tag :color="config.service.enable_level?'green':'red'">
									{{config.service.enable_level?'是':'否'}}
								</Tag>
								<span>是否开启学员服务星级</span>
							</p>
						</td>
						<td style="vertical-align: top">说明：开启后服务人员会根据不同的服务星级，对学员采取更优质的服务或更有针对性的分层服务</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('service_level')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>课程授课方式</td>
						<td>
							<p>
								<Tag v-for="item in config.lesson.enable_lesson_type">
									{{map_lesson_type[item]}}								
								</Tag>							
							</p>
						</td>
						<td style="vertical-align: top">说明：添加课程时，可选择的授课方式</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('enable_lesson_type')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>打印模板启用</td>
						<td colspan="2">
							<p>
								<Tag v-for="item in config.system.enable_print_tpls">
									{{map_print_tpl[item]}}								
								</Tag>							
							</p>
						</td>
						
						<td>
							<Button type="text" size="small" @click="modifyConfig('enable_print_tpls')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>课程有效期</td>
						<td>
							<p>
								<Tag :color="config.must_input_expire_day?'green':'red'">
									{{config.must_input_expire_day?'是':'否'}}
								</Tag>
								<span>课程有效期是否必填</span>
							</p>
						</td>
						<td style="vertical-align: top">说明：开启后课程有效期必填</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('must_input_expire_day')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>课包有效期</td>
						<td>
							<p>
								<Tag :color="config.dashboard.show_sl_expire_warn?'green':'red'">
									{{config.dashboard.show_sl_expire_warn?'是':'否'}}
								</Tag>
								<span>是否开启课包有效期设置预警</span>
							</p>
						</td>
						<td style="vertical-align: top">说明：开启后工作台将显示课包有效期设置预警</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('show_sl_expire_warn')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>学员档案列表</td>
						<td>
							<p>
								<Tag :color="config.student_list_show_lesson_hours?'green':'red'">
									{{config.student_list_show_lesson_hours?'是':'否'}}
								</Tag>
								<span>是否显示剩余课时</span>
							</p>
							<p>
								<Tag :color="config.student_list_show_lesson_expire?'green':'red'">
									{{config.student_list_show_lesson_expire?'是':'否'}}
								</Tag>
								<span>是否显示课程有效期</span>
							</p>
						</td>
						<td style="vertical-align: top">
							<p>说明：开启显示课程有效期后，在学员列表会显示课程有效期一列，如果有多个课程显示的是有效期最长的课时</p>
						</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('student_list')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>课评</td>
						<td>
							<p>
								<Tag :color="config.service.enable_free_review_style?'green':'red'">
									{{config.service.enable_free_review_style?'是':'否'}}
								</Tag>
								<span>是否可以自由选择课评模板</span>
							</p>
							<p>
								<Tag :color="config.service.enable_modify_rap?'green':'red'">
									{{config.service.enable_modify_rap?'是':'否'}}
								</Tag>
								<span>是否可以修改专业课评高级参数</span>
							</p>
						</td>
						<td style="vertical-align: top">
							<p>说明：开启后可在点评时可自由选择课评模板</p>
						</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('enable_free_review_style')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>学管师</td>
						<td>
							<p>
								<Tag :color="config.service.enable_multi_eid?'green':'red'">
									{{config.service.enable_multi_eid?'是':'否'}}
								</Tag>
								<span>是否可以一个学生分配到多个学管师</span>
							</p>
						</td>
						<td style="vertical-align: top">
							<p>说明：开启后一个学生可以分配到多个学管师</p>
						</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('enable_multi_eid')">修改</Button>
						</td>
					</tr>
					<tr>
						<td>学员转班</td>
						<td>
							<p>
								<Tag :color="config.class.transfer_limit_lesson?'green':'red'">
									{{config.class.transfer_limit_lesson?'是':'否'}}
								</Tag>
								<span>是否开启转入班级选择的限制</span>
							</p>
						</td>
						<td style="vertical-align: top">
							<p>说明：开启后转入班级按照课程限制</p>
						</td>
						<td>
							<Button type="text" size="small" @click="modifyConfig('transfer_limit_lesson')">修改</Button>
						</td>
					</tr>
				</template>
			</tbody>
		</table>
		<Spin size="large" fix v-if="loading"></Spin>
		<div class="clearfix">
			<Button class="mt-2 pull-right" type="primary" @click="restoreDefault">恢复默认设置</Button>
		</div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import config from '@/libs/config.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default{
		mixins:[config,common,globals],
		data () {
			return {
				cfg_name:'params',
				student_leave_unit: 'day',
				student_leave_value: 1,
				showConfig: {
					system: true,
					customer: false,
					signup: false,
					arrange: false,
					attendance: false,
					studentmobile: false,
					orgmobile: false,
					other: false
				},
				config: {	
					org_name:'',				
					sysname:'',
					address: '',
					mobile: '',
					currency_symbol:'',
					head:{
						show_contact:0,
						contact:''
					},
					present_lesson_consume_method: 1,
					ignore_time_long_clh: 0,
					class_must_sel_lesson: 0,
					customer: {
						pc_auto_recycle:0,
						pc_un_follow_days: 15,
						pc_before_remind_days: 2,
						pc_limit_customer_num: 200,
						follow_warning_days:7,
						must_mc_id: 1,
						must_from_did: 1,
						must_intention_level: 1,
						must_customer_status_did: 1,
						allow_cu_add:1
					},										
					lesson: {
						enable_lesson_type: [0]
					},
					must_input_expire_day: 0,
					remind_before_course: {
						days_before: 1
					},
					class_attendance: {
						enable_extra_consume: 0,
						min_after_class: 10,
						min_before_class: 10,
						allow_debt_att: 0,
						reg_att_before_min: 10,
						enable_money_consume: 0,
						allow_reg_history: 1,
						reg_history_pass_days: 0,
						reg_history_pass_months: 0,
						allow_del_history: 1,						
						del_history_pass_days: 0,
						del_history_pass_months: 0,
						print_attendance_bill: 0,
						sl_bcu_subject: 0,
						swipe_card_notify_mode:1,
						enable_free_attendance:0,
						show_expire_day: 0
					},
					return_visit:{
						absence_times: 3,
						ask_leave_times: 3,
						not_hand_in_homework_times: 3,
						student_lesson_remain_times: 5,
						student_lesson_remain_rate: 0.30
					},
					service: {
						auto_create_record: 0,
						enable_homework_star: 0,
						enable_homework_task_tpl: 0,
						enable_regular_homework: 0,
						enable_level:0,
						max_level:5,
						auto_reply_review:0,
						auto_reply_review_dd:5,
						auto_reply_review_star:5,
						auto_reply_review_text:'超期未回评,系统自动好评',
						remind_push_policy:0
					},
					student_leave: {
						minutes_before: 1440,
						enable: true,
						times_limit: 0,
						regatt_default_consume: 0,
						limit_policy: 0,   //请假限制策略，0按课时1按月限制
						month_limit_num: 1,   //每月允许请假次数
					},
					student_makeup: {
						allow_different_lesson: 0
					},
					course_arrange: {
//						ignore_1by1_cc: 0,
						allow_mobile_change: 1,
						ignore_class_cc: 0,
						ignore_class_ec: 0,
						ignore_student_cc: 0,
						enable_tbs: 0,
						is_bk_open: 0,
						bk_cancel_hour: 24,
						bk_allow_start_day: 1,	//可提前预约天数
						bk_allow_end_day: 30,	//可预约排课范围
						bk_lesson_limit: 0,
						enable_arrange_status:0,
						enable_time_section:1,
					},
					student_signup:{
						allow_modify_date:1,
						modify_date_days:365,
						modify_date_months:0,
						enable_user_receipt_no:0,
						enable_user_contract_no:0,
						precharge_contract_month:12,
						enable_debit_card:1,
						must_from_did: 0,
						empty_oi_consume_type:1,
						confirm_order_text:'确定',
						save_order_text:'保存订单',
						default_pay_amount:1,
						enable_contract_print:1
					},
					student_refund: {
						allow_modify_date:1,
						modify_date_days:15,
						modify_date_months:0,
						enable_empty_refund:0
					},
					default_sale_role_did:{
						new: '',
						renew: ''
					},
					leave_warn_times: 5,
					lesson_warn_days: 30,
					lesson_warn_nums: 1,
					lesson_warn_mode: 0,
					enable_company: 0,
					enable_online_lesson:0,
					member: {
						enable: 0,
						level: [],
						max_level: 5,
						name: ''
					},
					teacher_level: {
						enable: 0,
						level: [],
						max_level: 5
					},
					xxgj: {
						hide_student_lesson: 0,
						show_comb_student_attendance:0,
						show_consume_lesson_hours:0
					},
					jyzs: {
						hide_student_review: 0,
						pj_employee_hide_student:0,
						pj_employee_forbid_cc:0,
						enable_free_attendance:0,
						enable_cancel_attendance:1,
						disable_attendance:0
					},
					app: {
						enable_material_bid: 0
					},
					student_list_show_lesson_hours:1,
					student_list_show_lesson_expire:0
				},
			}
		},
		mounted() {
			
		},
		computed: {
			remind_before() {
				const map = {0:'今天',1:'明天',2:'后天',3:'大后天'}
				return map[this.config.remind_before_course.days_before]
			},
			present_consume_rule() {
				const map = {1:'先消耗正常课时，再消耗赠送课时',2:'按平均单价计算'}
				return map[this.config.present_lesson_consume_method]
			},
			default_pay_amount() {
				const map = {0:'不填写',1:'剩余应缴金额'}
				return map[this.config.student_signup.default_pay_amount]
			}
		},
		methods: {
			show(t) {
				this.showConfig[t] = !this.showConfig[t]
			},
			modifyConfig(value) {
				let title = '';
				switch(value) {
					case 'system':
						title = '修改系统参数';
						break;
					case 'head':
						title = '修改总部联系方式'
						break
					case 'class':
						title = '修改班级是否必须属于课程';
						break;
					case 'grade':
						title = '修改是否启用年级';
						break;
					case 'hour':
						title = '修改默认课时定义';
						break;
					case 'remind_before':
						title = '修改课前提醒';
						break;
					case 'attend':
						title = '修改点名考勤';
						break;
					case 'leave':
						title = '修改学员请假';
						break;
					case 'leave_warn_times':
						title = '修改请假预警';
						break;
					case 'lesson_warn_days':
						title = '修改有效期预警';
						break;
					case 'lesson_warn_nums':
						title = '修改课时预警';
						break;
					case 'present_consume_rule':
						title = '修改赠送课时消耗规则';
						break;
					case 'signup':
						title = '修改报名缴费参数';
						break;
					case 'consume_type':
						title = '默认收费类型';
						break;
					case 'refund':
						title = '修改退费日期';
						break;
					case 'sale_role':
						title = '修改默认业绩归属人销售角色';
						break;
					case 'ignore':
						title = '修改冲突';
						break;
					case 'course_arrange_func':
						title = '排课功能参数设置';
						break;
					case 'allow_mobile_change':
						title: '修改移动端调课限制';
					case 'return_visit':
						title = '修改学员回访';
						break;
					case 'reg_att_before_min': 
						title = '登记考勤设置';
						break;
					case 'swipe':
						title = '刷卡设置';
						break;
					case 'company':
						title = '修改是否启用分公司';
						break;
					case 'project':
						title = '修改是否启用项目';
						break;
					case 'online':
						title = '修改是否启用线上课';
						break;
					case 'material':
						title = '物品管理设置';
						break;
					case 'service':
						title = '修改作业配置'
						break
					case 'vip':
						title = '修改会员体系配置'
						break
					case 'teacher_level':
						title = '教师星级设置'
						break
					case 'allow_passed_arrange':
						title = '修改排课限制'
						break
					case 'service_level':
						title = '修改是否启用服务星级'
						break
					case 'enable_lesson_type':
						title = '修改课程授课方式'
						break	
					case 'hide_student_review':
						title = '修改学员回评可见'
						break
					case 'enable_free_attendance':
						title = '修改教育助手自由考勤可见'
						break
					case 'disable_attendance':
						title = '修改教育助手是否允许登记考勤'
						break
					case 'enable_cancel_attendance':
						title = '修改教育助手考勤撤销设置'
						break
					case 'class_attendance_list_mode':
						title = '修改授课记录呈现方式'
						break
					case 'jyzs':
						title = '教育助手设置'
						break
					case 'enable_extra_consume':
						title = '修改是否开启额外课消'
						break
					case 'enable_money_consume':
						title = '修改是否开启考勤扣余额'
						break
					case 'enable_user_contract_no':
						title = '修改是否开启自定义合同号'
						break
					case 'enable_user_receipt_no':
						title = '修改是否开启自定义收据号'
						break
					case 'allow_reg_history':
						title  = '修改是否允许登记历史考勤'
						break
					case 'allow_del_history':
						title  = '修改是否允许撤销历史考勤记录'
						break
					case 'sl_bcu_subject':
						title  = '修改课时是否按科目通用'
						break
					case 'enable_debit_card':
						title = '修改储值相关参数'
						break
					case 'enable_free_attendance':
						title = '修改自由考勤设置'
						break
					case 'student_signup.must_from_did':
						title = '修改学员档案强制选择招生来源'
						break
					case 'customer.must_mc_id':
						title = '修改录入客户强制选择市场渠道'
						break
					case 'customer.must_from_did':
						title = '修改录入客户强制选择招生来源'
						break
					case 'must_intention_level':
						title = '修改录入客户强制选择意向程度'
						break
					case 'must_customer_status_did':
						title = '修改录入客户强制选择客户状态'
						break
					case 'allow_cu_add':
						title = '修改是否允许直接录入客户名单'
						break
					case 'print_bill_type':
						title = '修改缴费打印默认模板'
						break
					case 'enable_invoice_print':
						title = '修改INVOICE打印'
						break
					case 'enable_contract_print':
						title = '修改合同打印'
						break
					case 'default_sm_pwd_type':
						title = '修改学习管家默认密码'
						break
					case 'xxgj':
					case 'hide_order_amount':
						title = '修改学习管家参数配置'
						break
				
					case 'bk':
						title = '修改学习管家预约活动课'
						break
					case 'enable_tbs':
						title = '修改是否启用授课内容设定'
						break
					case 'must_input_expire_day':
						title = '修改课程有效期是否必填'
						break
					case 'is_bk_open':
						title = '修改课程约课设置'
						break
					case 'customer':
						title = '修改客户公海设置'
						break
					case 'student_list':
						title = '修改学员档案列表显示设置'
						break
					case 'enable_iae_check':
						title = '修改收财务审核设置'
						break
					case 'auto_reduce_debit_consume':
						title ='修改缴费自动扣课耗'
						break
					case 'enable_attendance_check':
						title = '修改1对1考勤是否启用审核'
						break
					case 'enable_free_review_style':
						title = '修改自由选择课评模板'
						break
					case 'enable_multi_eid':
						title = '修改是否允许一个学生可以分配到多个学管师'
						break
					case 'transfer_limit_lesson':
						title = '学员转班设置'
						break	
					case 'auto_reply_review':
						title = '学员回评设置'
						break	
					case 'allow_free_hour_section':
						title = '修改调课是否自由选择时间段'
						break;
					case 'enable_er_lesson_hour':
						title = '修改业绩记录时是否统计课时数'
						break;
					case 'need_lha':
						title = '修改是否在缴费时安排上课'
						break;
					case 'enable_classroom_live':
						title = '修改是否开启教室直播'
						break;
					case 'allow_different_lesson':
						title = '修改是否允许不同课程学员同班补课或一对多学员排课'
						break;
					case 'enable_arrange_status':
						title = '修改是否启用1对多/1对1排课状态'
						break;
					case 'show_student_grade':
						title = '修改排课表是否显示学员年级'
						break;
					case 'enable_modify_saved_order':
						title = '是否允许修改已保存订单'
						break;
					case 'arrange_warn_policy':
						title = '修改排课预警策略'
						break;
					case 'show_sl_expire_warn':
						title = '是否开启课包有效期设置预警'
						break;
					case 'enable_service_remind_push':
						title = '周期服务提醒设置'
						break;
					case 'bill_no_rule':
						title = '编号规则设置'
						break;
				}
				this.$Modal.open('system/configs/params/modify-modal.vue',{
					props: {
						data: this.config
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
			},
			initFinished () {
				if(this.config.student_leave.minutes_before >= 1440){
					this.student_leave_unit = 'day'
					this.student_leave_value = this.config.student_leave.minutes_before/1440
				}else{
					this.student_leave_unit = 'min'
					this.student_leave_value = this.config.student_leave.minutes_before
				}
			},
			getRate () {
				return this.config.return_visit.student_lesson_remain_rate*100
			},
			setRate (val) {
				this.config.return_visit.student_lesson_remain_rate = parseFloat(val/100).toFixed(2)
			},
			changeLessonConfig () {
				let result = this.config.return_visit.student_lesson_remain_times>0?0:5 
				
				this.config.return_visit.student_lesson_remain_times = result				
			},
			showBranchSnoModal(){
				this.$Modal.open('system/staff/department/branch-sno-modal.vue')
				.then(modal=>{
					modal.show('校区单据编号序号设置','info')
				})
			}
		}
	}
</script>