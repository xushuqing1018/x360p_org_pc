<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="700px">
		<div class="pl-4">
			<Form>
				<Form-item label="" v-if="modify_type=='system'">
	    			<div>
	    				<label class="mr-3">机构名称</label> 
	    				<Input v-model="config.org_name" placeholder="机构名称" style="width: 380px"></Input>
	    			</div>
	    			<div>
	    				<label class="mr-3">机构地址</label> 
	    				<Input v-model="config.address" placeholder="机构地址" style="width: 380px"></Input>
	    			</div>
	    			<div>
	    				<label class="mr-3">联系电话</label> 
	    				<Input v-model="config.mobile" placeholder="联系电话" style="width: 380px"></Input>
	    			</div>
	    			<div>
	    				<label class="mr-3">货币符号</label> 
	    				<Input v-model="config.currency_symbol" placeholder="货币符号" style="width: 60px"></Input>
	    			</div>
	    		</Form-item>
				<Form-item label="" v-if="modify_type=='head'">
					<div class="mb-2">
	    				<label class="mr-3">是否显示总部联系方式</label>
		    			<i-switch v-model="config.head.show_contact" :true-value="1" :false-value="0">
		    				<span slot="open">是</span>
		    				<span slot="close">否</span>
		    			</i-switch>
		    		</div>
	    			<div v-if="config.head.show_contact == 1">
	    				<label class="mr-3">联系方式</label> 
	    				<Input v-model="config.head.contact" placeholder="总部联系方式" style="width: 380px"></Input>
	    			</div>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='class'">
	    			<i-switch v-model="config.class_must_sel_lesson" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='grade'">
	    			<i-switch v-model="config.enable_grade" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='customer.must_mc_id'">
	    			<i-switch v-model="config.customer.must_mc_id" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='customer.must_from_did'">
	    			<i-switch v-model="config.customer.must_from_did" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='must_intention_level'">
	    			<i-switch v-model="config.customer.must_intention_level" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='must_customer_status_did'">
	    			<i-switch v-model="config.customer.must_customer_status_did" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
				<Form-item label="" v-if="modify_type=='allow_cu_add'">
	    			<i-switch v-model="config.customer.allow_cu_add" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
				<Form-item label="" v-if="modify_type=='required_school_grade_from'">
	    			<i-switch v-model="config.customer.required_school_grade_from" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='customer'">
	    			<div class="mb-2">
	    				<label class="mr-3">是否启用未跟进客户自动回收到公海</label>
		    			<i-switch v-model="config.customer.pc_auto_recycle" :true-value="1" :false-value="0">
		    				<span slot="open">是</span>
		    				<span slot="close">否</span>
		    			</i-switch>
		    		</div>
	    			<div class="mb-2">	    				
	    					<label style="width:200px">未成交客户</label>
	    					<InputNumber :step="1" :min="0" v-model="config.customer.pc_un_follow_days"></InputNumber>
	    					天未跟进自动划入客户公海	    					
	    			</div>
	    			<div class="mb-2">	    				
	    					<label style="width:200px">划入前</label>
	    					<InputNumber :step="1" :min="0" v-model="config.customer.pc_before_remind_days"></InputNumber>
	    					天提醒责任人	    					
	    			</div>
	    			<div>	    				
    					<label style="width:200px">销售最多可拥有</label>
    					<InputNumber :step="1" :min="0" v-model="config.customer.pc_limit_customer_num"></InputNumber>
    					个未成交客户    					
	    			</div>
	    		</Form-item>
	    		<Form-item label="跟进预警设置" v-if="modify_type=='follow_warning_days'">
	    			<p>
	    				<InputNumber :step="1" :min="1" v-model="config.customer.follow_warning_days"></InputNumber>
	    				天未跟进的客户名字变为橙色
	    			</p>	
	    		</Form-item>
	    		
	    		<Form-item label="" v-if="modify_type=='reg_att_before_min'">
		    		<div class="mb-2">
		    			上课前
		    			<InputNumber class="ml-2 mr-2" v-model="config.class_attendance.reg_att_before_min" :min="1" :max="300"></InputNumber>
		    			分钟之内可以考勤
		    		</div>
		    	</Form-item>
	    		<Form-item label="" v-if="modify_type=='hour'">
		    		<div class="mb-2">
		    			1个课时价格
		    			<InputNumber class="ml-3 mr-3" v-model="config.per_lesson_hour_price" :min="0"></InputNumber>
		    			元
		    		</div>
		    		<div class="mb-2">
		    			单课时分钟数
		    			<InputNumber class="ml-3 mr-3" v-model="config.per_lesson_hour_minutes" :min="0"></InputNumber>

		    			分钟
		    		</div>
		    		<div class="mb-2">
		    			<label class="mr-3">是否忽略课时长度与扣课时关系</label>
		    			<i-switch v-model="config.ignore_time_long_clh" :true-value="1" :false-value="0">
		    				<span slot="open">是</span>
		    				<span slot="close">否</span>
		    			</i-switch>
		    		</div>
		    	</Form-item>
		    	<Form-item label="" v-if="modify_type=='remind_before'">
		    		<div class="mb-2">
						默认筛选
						<RadioGroup class="ml-2 mr-2" v-model="config.remind_before_course.days_before" type="button">
					        <Radio :label="0">今天</Radio>
					        <Radio :label="1">明天</Radio>
					        <Radio :label="2">后天</Radio>
					        <Radio :label="3">大后天</Radio>
					    </RadioGroup>
		    			上课的学员	
	    			</div>	
	    			<div class="mb-2">
		    			<label class="mr-3">同一学员同一天有多次课是否分多条推送</label>
		    			<i-switch v-model="config.service.remind_push_policy" :true-value="1" :false-value="0">
		    				<span slot="open">是</span>
		    				<span slot="close">否</span>
		    			</i-switch>
		    		</div>
		    	</Form-item>
		    	<Form-item label="" v-if="modify_type=='attend'">
		    		<div class="mb-2">
		    			上课前
		    			<InputNumber class="ml-2 mr-2" v-model="config.class_attendance.min_before_class" :min="1"></InputNumber>
		    			分钟之内可以考勤
		    		</div>
		    		<div class="mb-2">
		    			下课后
		    		<InputNumber class="ml-2 mr-2" v-model="config.class_attendance.min_after_class" :min="1"></InputNumber>
		    			分钟内可以考勤
		    		</div>
		    		<div class="mb-2">			    		
			    		<label class="mr-2">是否允许负课时考勤</label>
			    		<i-switch v-model="config.class_attendance.allow_debt_att" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
		    		<div class="mb-2">			    		
			    		<label class="mr-2">是否允许修改课时消耗数</label>
			    		<i-switch 
			    		v-model="config.class_attendance.allow_modify_consume_hour" 
			    		:true-value="1" 
			    		:false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
					<div class="mb-2">			    		
			    		<label class="mr-2">是否显示剩余课时有效期</label>
			    		<i-switch 
			    		v-model="config.class_attendance.show_expire_day" 
			    		:true-value="1" 
			    		:false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
		    	</Form-item>
		    	<Form-item label="" v-if="modify_type=='leave'">
		    		<div class="mb-2">			    		
			    		<label class="mr-2">是否允许请假</label>
			    		<i-switch v-model="config.student_leave.enable" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
		    		<div class="mb-2" v-if="config.student_leave.enable">
		    			至少提前	
		    			<InputNumber :min="1" :step="1" v-model="student_leave_value" @on-change="leaveUnitChange"></InputNumber>　
		    			<Select v-model="student_leave_unit" style="display: inline-block;width: 60px" @on-change="leaveUnitChange">
		    				<Option value="day">天</Option>
		    				<Option value="min">分钟</Option>
		    			</Select>
		    			请假 
		    		</div>
		    		<div class="mb-2" v-if="config.student_leave.enable">
						<RadioGroup v-model="config.student_leave.limit_policy">
								<Radio :label="0">按课时</Radio>
								<Radio :label="1">按月份</Radio>
						</RadioGroup>
						<br/>
		    			<span>允许请假</span>	
		    			
						<InputNumber v-if="config.student_leave.limit_policy==0"
						v-model="config.student_leave.times_limit" 
						:min="-2">
						</InputNumber>

						<InputNumber v-if="config.student_leave.limit_policy==1"
						v-model="config.student_leave.month_limit_num" 
						:min="-2">
						</InputNumber>

		    			次 <span style="color:#f60;">(0为不限制请假次数,-2为不允许请假,-1为不设置)</span>
		    			<Button type="ghost" class="ml-2" size="small" @click="setLeaveLimitBylesson">按课程设置</Button>
		    			<Button type="ghost" class="ml-2" size="small" @click="setLeaveLimitByStudent">按学员设置</Button>
		    		</div>
		    		<div class="mb-2">			    		
			    		<label class="mr-2">请假是否默认扣课时</label>
			    		<i-switch v-model="config.student_leave.regatt_default_consume" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
		    	</Form-item>
		    	<Form-item label="" v-if="modify_type=='allow_different_lesson'">
		    		<i-switch v-model="config.student_makeup.allow_different_lesson" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
		    	</Form-item>
		    	<Form-item label="" v-if="modify_type=='leave_warn_times'">
		    		<div class="mb-2">
		    			预警请假
		    			<InputNumber class="ml-2 mr-2" v-model="config.leave_warn_times" :min="1"></InputNumber>
		    			次以上的学员
		    		</div>
		    	</Form-item>
		    	<Form-item label="" v-if="modify_type=='lesson_warn_nums'">
		    		<div class="mb-2">
		    			预警剩余课时
		    			<InputNumber class="ml-2 mr-2" v-model="config.lesson_warn_nums" :min="0"></InputNumber>
		    			课时以下的学员
		    		</div>
		    		<RadioGroup v-model="config.lesson_warn_mode">
	    				<Radio :label="0" style="display: block;">按学员的单个课程剩余课时来预警。</Radio>
	    				<Radio :label="1" style="display: block;">按学员的总剩余课时来预警。</Radio>
	    			</RadioGroup>
		    	</Form-item>
				<Form-item label="" v-if="modify_type=='class_attendance_list_mode'">

					<RadioGroup v-model="config.class_attendance.list_mode">
						<Radio :label="0" style="display: block;">只显示考勤相关(默认)</Radio>
						<Radio :label="1" style="display: block;">考勤+课耗</Radio>
					</RadioGroup>
				</Form-item>
				<Form-item label="" v-if="modify_type=='lesson_warn_days'">
		    		<div class="mb-2">
		    			预警有效期
		    			<InputNumber class="ml-2 mr-2" v-model="config.lesson_warn_days" :min="1"></InputNumber>
		    			天以下的学员
		    		</div>
		    	</Form-item>
		    	<Form-item label="" v-if="modify_type=='present_consume_rule'">
	    			<RadioGroup v-model="config.present_lesson_consume_method">
	    				<Radio :label="1" style="display: block;">先消耗正常课时，再消耗赠送课时。</Radio>
	    				<Radio :label="2" style="display: block;">按平均单价计算。</Radio>
	    			</RadioGroup>
	    		</Form-item>
				<Form-item label="" v-if="modify_type=='signup'">
		    		<div class="mb-2">			    		
			    		<label class="mr-2">是否允许修改</label>
			    		<i-switch v-model="config.student_signup.allow_modify_date" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
		    		<template v-if="config.student_signup.allow_modify_date">		    			
		    			<div class="mb-2">
		    				<label>按天数：</label><span>允许天数</span>
			    			<InputNumber v-model="config.student_signup.modify_date_days" :min="0"></InputNumber> 天 
			    			<span style="color:#f60;">(0为不限制)</span>
		    			</div>
		    			<div class="mb-2">
		    				<label>按月份：</label>
		    				<Select v-model="config.student_signup.modify_date_months" style="width: 200px">
			    				<Option :value="0">不限制</Option>
			    				<Option :value="1">本月</Option>
			    				<Option :value="2">本月及上个月</Option>
			    				<Option :value="3">本月及前3个月</Option>
			    			</Select>
		    			</div>
		    			<span style="color:#f60;">同时设置月份与天数将优先使用天数规则</span>
		    		</template>
		    		<div class="mb-2">
		    			<label class="mr-2">缴费默认金额</label>
		    			<RadioGroup class="ml-2 mr-2" v-model="config.student_signup.default_pay_amount" type="button">
					        <Radio :label="0">为空</Radio>
					        <Radio :label="1">剩余应缴金额</Radio>
					    </RadioGroup>
		    		</div>
		    		<div class="mb-2">
	    				<label class="mr-3">保存订单文字</label> 
	    				<Input v-model="config.student_signup.save_order_text" placeholder="保存订单文字" style="width: 180px"></Input>
	    			</div>
	    			<div class="mb-2">
	    				<label class="mr-3">确认订单文字</label> 
	    				<Input v-model="config.student_signup.confirm_order_text" placeholder="确认订单文字" style="width: 180px"></Input>
	    			</div>
					<div class="mb-2">			    		
			    		<label class="mr-2">是否收款账号默认为空</label>
			    		<i-switch v-model="config.student_signup.default_aa_empty" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
		    	</Form-item>
		    	<Form-item label="" v-if="modify_type=='consume_type'">
		    		<div class="mb-2">			    		
			    		<label class="mr-2">没有报名记录的学员收费类型是否默认设置为新报</label>
			    		<i-switch v-model="config.student_signup.empty_oi_consume_type" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
		    		<div class="mb-2">
		    			<table class="modal-table">
							<thead>
								<tr>
									<th><div class="ivu-table-cell">值</div></th>
									<th><div class="ivu-table-cell">名称</div></th>
									<th><div class="ivu-table-cell">启用</div></th>
									
								</tr>
							</thead>
							<tbody>
								<tr v-for="(item,index) in config.student_signup.consume_types">
									<td>
										<div class="ivu-table-cell">
											{{item.value}}
										</div>
									</td>
									<td>
										<div class="ivu-table-cell" v-if="item.value > 3">
											<Input v-model="item.label" style="width: 100px;" size="small"></Input>
										</div>
										<div class="ivu-table-cell" v-else>
											{{item.label}}
										</div>
									</td>
									<td>
										<div class="ivu-table-cell" v-if="item.value > 2">
											<i-switch 
											v-model="item.enable" 
											:true-value="1" 
											:false-value="0">
								    			<span slot="open">是</span>
								    			<span slot="close">否</span>
								    		</i-switch>
										</div>
										<div class="ivu-table-cell" v-else>
											是
										</div>
									</td>
								</tr>
							</tbody>
						</table>
		    		</div>
		    	</Form-item>
		    	<Form-item label="" v-if="modify_type=='need_lha'">
		    		<div class="mb-2">			    		
			    		<label class="mr-2">是否启用缴费时安排课时排课</label>
			    		<i-switch v-model="config.student_signup.need_lha" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
		    		<div class="mb-2" v-if="config.student_signup.need_lha">			    		
			    		<label class="mr-2">是否必须在缴费时安排课时</label>
			    		<i-switch v-model="config.student_signup.must_input_lha" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
	    			
	    		</Form-item>
				<Form-item label="" v-if="modify_type=='refund'">
		    		<div class="mb-2">			    		
			    		<label class="mr-2">是否允许修改</label>
			    		<i-switch v-model="config.student_refund.allow_modify_date" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
		    		<template v-if="config.student_refund.allow_modify_date">		    			
		    			<div class="mb-2">
		    				<label>按天数：</label><span>允许天数</span>
			    			<InputNumber v-model="config.student_refund.modify_date_days" :min="0"></InputNumber> 天 
			    			<span style="color:#f60;">(0为不限制)</span>
		    			</div>
		    			<div class="mb-2">
		    				<label>按月份：</label>
		    				<Select v-model="config.student_refund.modify_date_months" style="width: 200px">
			    				<Option :value="0">不限制</Option>
			    				<Option :value="1">本月</Option>
			    				<Option :value="2">本月及上个月</Option>
			    				<Option :value="3">本月及前3个月</Option>
			    			</Select>
		    			</div>
		    			<span style="color:#f60;">同时设置月份与天数将优先使用天数规则</span>
		    		</template>
		    		<div class="mb-2">			    		
			    		<label class="mr-2">是否启用课耗满额退费</label>
			    		<i-switch v-model="config.student_refund.enable_empty_refund" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
		    	</Form-item>
	    		<Form-item label="" v-if="modify_type=='enable_user_receipt_no'">
	    			<i-switch v-model="config.student_signup.enable_user_receipt_no" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='enable_user_contract_no'">
	    			<i-switch v-model="config.student_signup.enable_user_contract_no" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='student_signup.must_from_did'">
	    			<i-switch v-model="config.student_signup.must_from_did" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='sale_role'">
	    			<div>
	    				<label class="mr-3">新生报名</label>
	    				<Select v-model="config.default_sale_role_did.new" style="width:200px">
	    					<Option v-for="item in sale_roles" :value="item.did">{{item.title}}</Option>
	    				</Select>
	    			</div>
	    			<div>
	    				<label class="mr-3">老生续报</label>
	    				<Select v-model="config.default_sale_role_did.renew" style="width:200px">
	    					<Option v-for="item in sale_roles" :value="item.did">{{item.title}}</Option>
	    				</Select>
	    			</div>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='course_arrange_func'">
	    			
	    			<div>
	    				<label class="mr-3">是否启用标准上课时间段</label>
	    				<i-switch v-model="config.course_arrange.enable_time_section" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
	    			</div>
	    			
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='ignore'">
	    			<!--<div>
	    				<label class="mr-3">是否忽略1对1排课教室冲突</label>
	    				<i-switch v-model="config.course_arrange.ignore_1by1_cc" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
	    			</div>-->
	    			<div>
	    				<label class="mr-3">是否忽略排课教室冲突</label>
	    				<i-switch v-model="config.course_arrange.ignore_class_cc" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
	    			</div>
	    			<div>
	    				<label class="mr-3">是否忽略排课教师冲突</label>
	    				<i-switch v-model="config.course_arrange.ignore_class_ec" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
	    			</div>
	    			<div>
	    				<label class="mr-3">是否忽略学员排课冲突</label>
	    				<i-switch v-model="config.course_arrange.ignore_student_cc" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
	    			</div>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='allow_mobile_change'">
	    			<i-switch v-model="config.course_arrange.allow_mobile_change" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<template  v-if="modify_type=='allow_passed_arrange'">
	    			<Form-item label="是否允许授课对象为空">
		    			<i-switch v-model="config.course_arrange.allow_empty_teachobj" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</Form-item>
					<Form-item label="是否允许教室为空">
		    			<i-switch v-model="config.course_arrange.allow_empty_cc" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</Form-item>
		    		<Form-item label="是否允许过期排课">
		    			<i-switch v-model="config.course_arrange.allow_passed_arrange" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</Form-item>
		    		<Form-item label="是否限制选取本校区老师">
		    			<i-switch v-model="config.course_arrange.select_teacher_limit" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</Form-item>
					<Form-item label="1对多排课默认限制人数">
		    				
			    		<InputNumber v-model="config.course_arrange.multi_lesson_limit_student" :min="0"></InputNumber> 人 
			    			
					</Form-item>
		    	</template>
	    		<Form-item label="" v-if="modify_type=='enable_tbs'">
	    			<i-switch v-model="config.course_arrange.enable_tbs" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='return_visit'">
	    			<div class="mb-2">
		    			显示请假
		    			<InputNumber class="ml-3 mr-3" v-model="config.return_visit.ask_leave_times" :min="1"></InputNumber>
		    			次以上的学员
		    		</div>
		    		<div class="mb-2">
		    			显示缺勤
		    			<InputNumber class="ml-3 mr-3" v-model="config.return_visit.absence_times" :min="1"></InputNumber>
		    			显示次以上的学员
		    		</div>
		    		<div class="mb-2">
		    			显示未交作业
		    			<InputNumber class="ml-3 mr-3" v-model="config.return_visit.not_hand_in_homework_times" :min="1"></InputNumber>
		    			次以上的学员
		    		</div>
		    		<div class="mb-2">
		    			<template v-if="config.return_visit.student_lesson_remain_times">
			    			显示剩余课次总量
			    			<InputNumber class="ml-3 mr-3" v-model="config.return_visit.student_lesson_remain_times" :min="0"></InputNumber>
		    			</template>
		    			<template v-else>
		    				显示剩余课次百分比
			    			<InputNumber class="ml-3" :value="getRate()" :step="10" :min="0" :max="100" @on-change="setRate"></InputNumber>
			    			<span class="mr-3">%</span>			    			
		    			</template>
		    			
		    			<Button class="ml-3" type="ghost" icon="arrow-swap" @click="changeLessonConfig">更换条件</Button>
		    		</div>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='company'">
	    			<i-switch v-model="config.enable_company" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='project'">
	    			<i-switch v-model="config.enable_project" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='online'">
	    			<i-switch v-model="config.enable_online_lesson" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="是否启用物品独立校区管理" v-if="modify_type=='material'">
	    			<i-switch v-model="config.app.enable_material_bid" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="是否开启作业星级" v-if="modify_type=='service'">
	    			<i-switch v-model="config.service.enable_homework_star" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
				<Form-item label="是否可以自由选择作业模板" v-if="modify_type=='service'">
	    			<i-switch v-model="config.service.enable_homework_task_tpl" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
				<Form-item label="是否启用打卡作业" v-if="modify_type=='service'">
	    			<i-switch v-model="config.service.enable_regular_homework" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<template v-if="modify_type=='service_level'">
	    			<Form-item label="是否开启服务星级">
		    			<i-switch v-model="config.service.enable_level" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
	    			</Form-item>
	    			<Form-item label="服务最高星级" v-if="config.service.enable_level">
	    				<InputNumber v-model="config.service.max_level" :min="2" :max="10"></InputNumber>
	    			</Form-item>
	    		</template>
	    		<template v-if="modify_type=='vip'">
	    			<Form-item label="是否启用会员体系">
						<i-switch v-model="config.member.enable" :true-value="1" :false-value="0">
							<span slot="open">是</span>
							<span slot="close">否</span>
						</i-switch>
					</Form-item>
					<template v-if="config.member.enable">
						<Form-item label="会员体系名称">
							<Input v-model="config.member.name" style="width:260px;"></Input>
						</Form-item>
						<Form-item label="会员等级设置">
							<InputNumber :value="0" readonly></InputNumber>
							&nbsp;~&nbsp;
							<InputNumber v-model="config.member.max_level" :min="1" :max="5" @on-change="maxLevelChange"></InputNumber>
							(目前最高等级为5)
						</Form-item>
						<Form-item label="会员等级定义" :label-width="85">
							<table class="modal-table">
								<thead>
									<tr>
										<th><div class="ivu-table-cell">等级</div></th>
										<th><div class="ivu-table-cell">名称</div></th>
										<th><div class="ivu-table-cell">累计缴费</div></th>
										<th><div class="ivu-table-cell">享有折扣</div></th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="(item,index) in config.member.level">
										<td>
											<div class="ivu-table-cell">
												{{index}}
											</div>
										</td>
										<td><div class="ivu-table-cell">
											<Input v-model="item.name" style="width: 100px;"></Input></div>
										</td>
										<template v-if="index==0">
											<td><div class="ivu-table-cell"></div></td>
											<td><div class="ivu-table-cell"></div></td>
										</template>
										<template v-else>
											<td><div class="ivu-table-cell">
												<Input v-model="item.amount" style="width: 100px;"></Input></div>
											</td>
											<td><div class="ivu-table-cell">
												<Input v-model="item.discount" style="width: 100px;"></Input></div>
											</td>
										</template>
									</tr>
								</tbody>
							</table>
						</Form-item>
					</template>
	    		</template>
	    		<template v-if="modify_type=='teacher_level'">
	    			<Form-item label="是否启用教师星级">
						<i-switch v-model="config.teacher_level.enable" :true-value="1" :false-value="0">
							<span slot="open">是</span>
							<span slot="close">否</span>
						</i-switch>
					</Form-item>
					<template v-if="config.teacher_level.enable">
						
						<Form-item label="教师等级设置">
							<InputNumber :value="0" readonly></InputNumber>
							&nbsp;~&nbsp;
							<InputNumber v-model="config.teacher_level.max_level" :min="1" :max="5" @on-change="maxTeacherLevelChange"></InputNumber>
							(目前最高等级为5)
						</Form-item>
						<Form-item label="教师等级定义" :label-width="85">
							<table class="modal-table">
								<thead>
									<tr>
										<th><div class="ivu-table-cell">等级</div></th>
										<th><div class="ivu-table-cell">名称</div></th>
										
									</tr>
								</thead>
								<tbody>
									<tr v-for="(item,index) in config.teacher_level.level">
										<td>
											<div class="ivu-table-cell">
												{{index}}
											</div>
										</td>
										<td><div class="ivu-table-cell">
											<Input v-model="item.name" style="width: 100px;"></Input></div>
										</td>
										
									</tr>
								</tbody>
							</table>
						</Form-item>
					</template>
	    		</template>
	    		<Form-item label="课程授课设置" v-if="modify_type=='enable_lesson_type'">
	    			<CheckboxGroup v-model="config.lesson.enable_lesson_type">
						<Checkbox :disabled="disabledLessonType(0)" :label="0">班课</Checkbox>
						<Checkbox :disabled="disabledLessonType(1)" :label="1">一对一</Checkbox>
						<Checkbox :disabled="disabledLessonType(2)" :label="2">一对多</Checkbox>
						<Checkbox :disabled="disabledLessonType(3)" :label="3">研学旅行团</Checkbox>
					</CheckboxGroup>
	    		</Form-item>
				<Form-item label="打印模板设置" v-if="modify_type=='enable_print_tpls'">
	    			<CheckboxGroup v-model="config.system.enable_print_tpls">
					<Checkbox :disabled="disabledPrintTpls(item.bill_type)" :label="item.bill_type" v-for="item in ptpls">{{item.title}}</Checkbox>						
				</CheckboxGroup>
	    		</Form-item>
	    		<Form-item label="是否开启额外课消" v-if="modify_type=='enable_extra_consume'">
	    			<i-switch v-model="config.class_attendance.enable_extra_consume" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="是否开启考勤扣余额" v-if="modify_type=='enable_money_consume'">
	    			<i-switch v-model="config.class_attendance.enable_money_consume" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="是否开启课时按科目通用" v-if="modify_type=='sl_bcu_subject'">
	    			<i-switch v-model="config.class_attendance.sl_bcu_subject" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="是否锁定班级课时" v-if="modify_type=='sl_bcu_subject'">
	    			<i-switch v-model="config.class_attendance.is_clh_locked" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>

	    		<Form-item label="是否启用自由考勤" v-if="modify_type=='free_attendance'">
	    			<i-switch v-model="config.class_attendance.enable_free_attendance" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>


				<Form-item label="是否隐藏学员课时" v-if="modify_type=='xxgj'">
	    			<i-switch v-model="config.xxgj.hide_student_lesson" :true-value="1" :false-value="0">
	    				<span slot="open">是</span>
		    			<span slot="close">否</span>
	    			</i-switch>
	    		</Form-item>
	    		<Form-item label="是否隐藏订单金额" v-if="modify_type=='xxgj'">
	    			<i-switch v-model="config.xxgj.hide_order_amount" :true-value="1" :false-value="0">
	    				<span slot="open">是</span>
		    			<span slot="close">否</span>
	    			</i-switch>
	    		</Form-item>
	    		<Form-item label="班级是否显示课程名称" v-if="modify_type=='xxgj'">
	    			<i-switch v-model="config.xxgj.class_show_lesson_name" :true-value="1" :false-value="0">
	    				<span slot="open">是</span>
		    			<span slot="close">否</span>
	    			</i-switch>
	    		</Form-item>
	    		<Form-item label="是否在考勤应用显示汇总课时" v-if="modify_type=='xxgj'">
	    			<i-switch v-model="config.xxgj.show_comb_student_attendance" :true-value="1" :false-value="0">
	    				<span slot="open">是</span>
		    			<span slot="close">否</span>
	    			</i-switch>
	    		</Form-item>
	    		<Form-item label="是否在考勤应用考勤列表显示扣课时数" v-if="modify_type=='xxgj'">
	    			<i-switch v-model="config.xxgj.show_consume_lesson_hours" :true-value="1" :false-value="0">
	    				<span slot="open">是</span>
		    			<span slot="close">否</span>
	    			</i-switch>
	    		</Form-item>
	    		<Form-item label="是否隐藏学员回评" v-if="modify_type=='hide_student_review'">
	    			<i-switch v-model="config.jyzs.hide_student_review" :true-value="1" :false-value="0">
	    				<span slot="open">是</span>
		    			<span slot="close">否</span>
	    			</i-switch>
	    		</Form-item>
	    		<Form-item label="是否启用自由考勤" v-if="modify_type=='enable_free_attendance'">
	    			<i-switch v-model="config.jyzs.enable_free_attendance" :true-value="1" :false-value="0">
	    				<span slot="open">是</span>
		    			<span slot="close">否</span>
	    			</i-switch>
	    		</Form-item>
				<Form-item label="是否禁用移动端考勤" v-if="modify_type=='disable_attendance'">
	    			<i-switch v-model="config.jyzs.disable_attendance" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="是否允许撤销考勤" v-if="modify_type=='enable_cancel_attendance'">
	    			<i-switch v-model="config.jyzs.enable_cancel_attendance" :true-value="1" :false-value="0">
	    				<span slot="open">是</span>
		    			<span slot="close">否</span>
	    			</i-switch>
	    		</Form-item>
	    		<Form-item label="是否对兼职老师隐藏学员菜单" v-if="modify_type=='jyzs'">
	    			<i-switch v-model="config.jyzs.pj_employee_hide_student" :true-value="1" :false-value="0">
	    				<span slot="open">是</span>
		    			<span slot="close">否</span>
	    			</i-switch>
	    		</Form-item>
	    		<Form-item label="是否禁止调课" v-if="modify_type=='jyzs'">
	    			<i-switch v-model="config.jyzs.pj_employee_forbid_cc" :true-value="1" :false-value="0">
	    				<span slot="open">是</span>
		    			<span slot="close">否</span>
	    			</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='allow_reg_history'">
		    		<div class="mb-2">			    		
			    		<label class="mr-2">是否允许登记历史考勤</label>
			    		<i-switch v-model="config.class_attendance.allow_reg_history" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
		    		<template v-if="config.class_attendance.allow_reg_history">		    			
		    			<div class="mb-2">
		    				<label>按天数：</label><span>允许天数</span>
			    			<InputNumber v-model="config.class_attendance.reg_history_pass_days" :min="0"></InputNumber> 天 
			    			<span style="color:#f60;">(0为不限制)</span>
		    			</div>
		    			<div class="mb-2">
		    				<label>按月份：</label>
		    				<Select v-model="config.class_attendance.reg_history_pass_months" style="width: 200px">
			    				<Option :value="0">不限制</Option>
			    				<Option :value="1">本月</Option>
			    				<Option :value="2">本月及上个月</Option>
			    				<Option :value="3">本月及前3个月</Option>
			    			</Select>
		    			</div>
		    			<span style="color:#f60;">同时设置月份与天数将优先使用天数规则</span>
		    		</template>
		    	</Form-item>
		    	<Form-item label="" v-if="modify_type=='allow_del_history'">
		    		<div class="mb-2">			    		
			    		<label class="mr-2">是否允许撤销历史考勤记录</label>
			    		<i-switch v-model="config.class_attendance.allow_del_history" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
		    		<template v-if="config.class_attendance.allow_del_history">
		    			<div class="mb-2">
			    			<label>按月份：</label>
			    			<span>允许天数</span>
			    			<InputNumber v-model="config.class_attendance.del_history_pass_days" :min="0"></InputNumber> 天 
			    			<span style="color:#f60;">(0为不限制)</span>
			    		</div>
			    		<div class="mb-2">
		    				<label>按月份：</label>
		    				<Select v-model="config.class_attendance.del_history_pass_months" style="width: 200px">
			    				<Option :value="0">不限制</Option>
			    				<Option :value="1">本月</Option>
			    				<Option :value="2">本月及上个月</Option>
			    				<Option :value="3">本月及前3个月</Option>
			    			</Select>
		    			</div>
		    			<span style="color:#f60;">同时设置月份与天数将优先使用天数规则</span>
	    			</template>
		    	</Form-item>
		    	<Form-item label="" v-if="modify_type=='swipe'">
		    		<div class="mb-2" v-if="is_gm">
		    			<label class="mr-2">是否启用二维码扫码考勤</label>
			    		<i-switch v-model="config.class_attendance.enable_qrcode_attendance" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
			    	</div>
		    		<div class="mb-2">
		    			<label class="mr-2">刷卡通知策略</label>
		    			<Select v-model="config.class_attendance.swipe_card_notify_mode" style="width: 200px">
			    				<Option :value="0">不发送任何通知</Option>
			    				<Option :value="1">只发考勤通知</Option>
			    				<Option :value="2">只发到离校通知</Option>
			    				<Option :value="3">既发到离校通知也发考勤通知</Option>
			    			</Select>
		    		</div>
		    		<div class="mb-2">
		    			<label class="mr-2">刷卡考勤是否出小票</label>
			    		<i-switch v-model="config.class_attendance.print_attendance_bill" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
			    	</div>
			    	<div class="mb-2">
		    			<label class="mr-2">刷卡考勤扣课时策略</label>
		    			<Select v-model="config.class_attendance.swipe_card_consume_mode" style="width: 200px">
			    				<Option :value="0">上一次课刷一次卡</Option>
			    				<Option :value="1">刷一次卡扣一天所有的课时</Option>
			    			</Select>
		    		</div>		    		
		    	</Form-item>

		    	<Form-item label="" v-if="modify_type=='enable_debit_card'">
		    		<div class="mb-2">			    		
			    		<label class="mr-2">是否启用储值功能</label>
			    		<i-switch v-model="config.student_signup.enable_debit" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>

		    		<div class="mb-2">			    		
			    		<label class="mr-2">是否启用储值卡储值</label>
			    		<i-switch v-model="config.student_signup.enable_debit_card" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>

		    		<div class="mb-2">			    		
			    		<label class="mr-2">是否启用无收款账号储值</label>
			    		<i-switch v-model="config.student_signup.enable_debit_without_aa_id" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
		    			
	    			<div class="mb-2" v-if="cfgBid==0">
	    				<label>储值协议默认有效期：</label>
	    				<Select v-model="config.student_signup.precharge_contract_month" style="width: 200px">
		    				<Option :value="1">1个月</Option>
		    				<Option :value="2">2个月</Option>
		    				<Option :value="3">3个月</Option>
		    				<Option :value="4">4个月</Option>
		    				<Option :value="5">5个月</Option>
		    				<Option :value="6">6个月(半年)</Option>
		    				<Option :value="12">12个月(1年)</Option>
		    				<Option :value="18">18个月(1年半)</Option>
		    				<Option :value="24">24个月(2年)</Option>
		    				<Option :value="36">36个月(3年)</Option>
		    			</Select>
	    			</div>
		    	</Form-item>
		    	<Form-item label="" v-if="modify_type=='print_bill_type'">
	    			<RadioGroup v-model="config.student_signup.print_bill_type">
						<Radio :label="1">收据</Radio>
						<Radio :label="2">合同</Radio>
					</RadioGroup>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='enable_invoice_print'">
	    			<i-switch v-model="config.student_signup.enable_invoice_print" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
				<Form-item label="" v-if="modify_type=='enable_contract_print'">
	    			<i-switch v-model="config.student_signup.enable_contract_print" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='default_sm_pwd_type'">
	    			<div>
		    			<label class="mr-2">默认密码</label>
		    			<Select v-model="config.service.default_sm_pwd_type" style="width: 200px">
		    				<Option :value="key" v-for="(value,key) in sm_pw_map">{{value}}</Option>
		    			</Select>
		    		</div>
	    			<div v-if="config.service.default_sm_pwd_type==5">
	    				<label class="mr-2">其他密码</label>
	    				<Input v-model="config.service.default_sm_pwd" style="width: 200px"></Input>
	    			</div>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='bk'">
	    			<div class="mb-2">			    		
			    		<label class="mr-2">是否启用班课活动课预约</label>
			    		<i-switch v-model="config.xxgj.enable_type0_bk" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
		    		<div class="mb-2">			    		
			    		<label class="mr-2">是否启用1对多活动课预约</label>
			    		<i-switch v-model="config.xxgj.enable_type2_bk" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
		    		<div class="mb-2" v-if="config.xxgj.enable_type0_bk">
	    				<label class="mr-2">班课活动课Tab名称</label>
	    				<Input v-model="config.xxgj.type0_tab_title" style="width: 200px"></Input>
	    			</div>
	    			<div class="mb-2" v-if="config.xxgj.enable_type2_bk">
	    				<label class="mr-2">1对多活动课Tab名称</label>
	    				<Input v-model="config.xxgj.type2_tab_title" style="width: 200px"></Input>
	    			</div>
	    		</Form-item>
					
	    		<Form-item label="" v-if="modify_type=='must_input_expire_day'">
	    			<i-switch v-model="config.must_input_expire_day" :true-value="1" :false-value="0">
	    				<span slot="open">是</span>
		    			<span slot="close">否</span>
	    			</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='show_sl_expire_warn'">
	    			<i-switch v-model="config.dashboard.show_sl_expire_warn" :true-value="1" :false-value="0">
	    				<span slot="open">是</span>
		    			<span slot="close">否</span>
	    			</i-switch>
	    		</Form-item>
		    	<Form-item label="" v-if="modify_type=='is_bk_open'">
		    		<div class="mb-2">
		    			<label class="mr-3">是否开启预约</label>
		    			<i-switch v-model="config.course_arrange.is_bk_open" :true-value="1" :false-value="0">
		    				<span slot="open">是</span>
		    				<span slot="close">否</span>
		    			</i-switch>
		    		</div>
		    		<template  v-if="config.course_arrange.is_bk_open">
			    		
			    		<div class="mb-2">
			    			预约限制：
			    			<p>最少提前
			    			<InputNumber class="ml-3 mr-3" v-model="config.course_arrange.bk_allow_start_day" :min="1"></InputNumber>
			    			天预约
			    			</p>
			    			<p>
			    			最多提前
			    			<InputNumber class="ml-3 mr-3" v-model="config.course_arrange.bk_allow_end_day" :min="1"></InputNumber>天预约
			    			</p>

			    		</div>
			    		<div class="mb-2">
			    			取消预约限制：
			    			<p>
			    			上课之前<InputNumber class="ml-3 mr-3" v-model="config.course_arrange.bk_cancel_hour" :min="1"></InputNumber>小时允许取消</p>
			    		</div>
			    		<div class="mb-2">
			    			课程预约限制：
			    			<p>
			    				<RadioGroup v-model="config.course_arrange.bk_lesson_limit" type="button">
			    					<Radio :label="0">所有课程可预约</Radio>
			    					<Radio :label="1">指定课程可预约</Radio>
			    					<Radio :label="2">指定课程不可预约</Radio>
			    				</RadioGroup>
			    				<Button 
			    					class="ml-2" 
			    					type="primary" 
			    					@click="lessonBkLimit" 
			    					v-if="config.course_arrange.bk_lesson_limit!=0"
			    					>指定课程
			    				</Button>
			    			</p>
			    		</div>
			    		<div class="mb-2">
			    			预约间隔限制：
			    			<p>
			    				<Button 
			    					type="primary" 
			    					@click="lessonSpaceLimit" 
			    					>设置课程
			    				</Button>
			    			</p>
			    		</div>
			    	</template>
		    	</Form-item>
		    	<Form-item label="" v-if="modify_type=='student_list'">
	    			<div class="mb-2">			    		
			    		<label class="mr-2">是否显示学员剩余课时</label>
			    		<i-switch v-model="config.student_list_show_lesson_hours" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>

		    		<div class="mb-2">			    		
			    		<label class="mr-2">是否显示学员课程有效期</label>
			    		<i-switch v-model="config.student_list_show_lesson_expire" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='enable_iae_check'">
					<div class="mb-2">			    		
			    		<label class="mr-2">是否启用订单审核</label>
			    		<i-switch v-model="config.iae.enable_order_check" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
		    		<div class="mb-2">			    		
			    		<label class="mr-2">是否启用缴费审核</label>
			    		<i-switch v-model="config.iae.enable_orb_check" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
					<div class="mb-2">			    		
			    		<label class="mr-2">是否禁止未审核订单课时排课</label>
			    		<i-switch v-model="config.iae.forbid_uncheck_arrange" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
					<div class="mb-2">			    		
			    		<label class="mr-2">是否禁止未审核订单课时分班</label>
			    		<i-switch v-model="config.iae.forbid_uncheck_assign" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
					<div class="mb-2">			    		
			    		<label class="mr-2">是否启用收支流水审核</label>
			    		<i-switch v-model="config.iae.enable_tally_check" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
		    		</div>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='auto_reduce_debit_consume'">
	    			<i-switch v-model="config.student_signup.auto_reduce_debit_consume" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='enable_attendance_check'">
	    			<i-switch v-model="config.class_attendance.enable_attendance_check" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
			<Form-item label="" v-if="modify_type=='enable_free_review_style'">
					<div class="mb-2">
						<label class="mr-2">是否可以自由选择课评模板</label>
		    			<i-switch v-model="config.service.enable_free_review_style" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
			    	</div>
			    	<div class="mb-2" v-if="is_gm">
						<label class="mr-2">是否可以修改专业课评高级参数</label>
		    			<i-switch v-model="config.service.enable_modify_rap" :true-value="1" :false-value="0">
			    			<span slot="open">是</span>
			    			<span slot="close">否</span>
			    		</i-switch>
			    	</div>
			</Form-item>
			<Form-item label="" v-if="modify_type=='enable_multi_eid'">
	    			<i-switch v-model="config.service.enable_multi_eid" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
			<Form-item label="" v-if="modify_type=='transfer_limit_lesson'">
	    			<i-switch v-model="config.class.transfer_limit_lesson" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='auto_reply_review'">
		    		<div class="mb-2">
		    			<label class="mr-3">是否开启学员自动回评</label>
		    			<i-switch v-model="config.service.auto_reply_review" :true-value="1" :false-value="0">
		    				<span slot="open">是</span>
		    				<span slot="close">否</span>
		    			</i-switch>
		    		</div>
		    		<template  v-if="config.service.auto_reply_review == 1">
			    		
			    		<div class="mb-2">
			    			
			    			<p>超过
			    			<InputNumber class="ml-3 mr-3" v-model="config.service.auto_reply_review_dd" :min="1"></InputNumber>
			    			天未回评自动回评
			    			</p>
			    		</div>
			    		
			    		<div class="mb-2">
			    			回评星级：
			    			<p>
			    				<Rate show-text v-model="config.service.auto_reply_review_star"></Rate>
			    			</p>
			    		</div>
			    		<div class="mb-2">
			    			回评内容
			    			<p>
			    				<Input type="textarea" v-model="config.service.auto_reply_review_text"></Input>
			    			</p>
			    		</div>
			    	</template>
		    	</Form-item>
	    		<Form-item label="" v-if="modify_type=='allow_free_hour_section'">
	    			<i-switch v-model="config.jyzs.allow_free_hour_section" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='enable_er_lesson_hour'">
	    			<i-switch v-model="config.iae.enable_er_lesson_hour" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='enable_classroom_live'">
	    			<i-switch v-model="config.xxgj.enable_classroom_live" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='enable_arrange_status'">
	    			<i-switch v-model="config.course_arrange.enable_arrange_status" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
				<Form-item label="" v-if="modify_type=='show_student_grade'">
	    			<i-switch v-model="config.course_arrange.show_student_grade" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='enable_modify_saved_order'">
	    			<i-switch v-model="config.student_signup.enable_modify_saved_order" :true-value="1" :false-value="0">
		    			<span slot="open">是</span>
		    			<span slot="close">否</span>
		    		</i-switch>
	    		</Form-item>
	    		<Form-item label="" v-if="modify_type=='arrange_warn_policy'">
	    			<div class="mb-2">
		    			<label class="mr-2">排课预警策略</label>
		    			<Select v-model="config.dashboard.arrange_warn_policy" style="width: 200px">
			    				<Option :value="0">按班级进行预警</Option>
			    				<Option :value="1">按老师进行预警</Option>
			    			</Select>
		    		</div>	
	    		</Form-item>
				<Form-item label="" v-if="modify_type=='enable_service_remind_push'">
	    			<i-switch v-model="config.service.enable_service_remind_push" :true-value="1" :false-value="0">
	    				<span slot="open">是</span>
		    			<span slot="close">否</span>
	    			</i-switch>
	    		</Form-item>
				<Form-item label="" v-if="modify_type == 'bill_no_rule'">
					<div>
	    				<label class="mr-3">订单编号</label> 
	    				<Input v-model="config.student_signup.order_no_rule" placeholder="订单编号规则"></Input>
	    			</div>
					<div>
	    				<label class="mr-3">收据编号</label> 
	    				<Input v-model="config.student_signup.order_receipt_bill_no_rule" placeholder="收据编号规则"></Input>
	    			</div>
					<div>
	    				<label class="mr-3">结转单编号</label> 
	    				<Input v-model="config.student_signup.order_transfer_no_rule" placeholder="结转编号规则"></Input>
	    			</div>
					<div>
	    				<label class="mr-3">退费单编号</label> 
	    				<Input v-model="config.student_signup.order_refund_no_rule" placeholder="退费编号规则"></Input>
	    			</div>
					<div>
	    				<label class="mr-3">学员学号</label> 
	    				<Input v-model="config.student_signup.student_no_rule" placeholder="学员编号规则"></Input>
	    			</div>
					<div>
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
					</div>
				</Form-item>
	    	</Form>
		</div>
		<div slot="footer">
			<Button type="ghost" :disabled="loading" @click="close">关闭</Button>
			<Button type="primary" :loading="loading" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	export default {
		mixins: [modal,common],
		props: {
			data: {
				type: Object,
				default:() => {
					return {}
				}
			},
			cfgBid: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				modify_type: '',
				config: util.copy(this.data),
				config_id: 0,
				loading: false,
				student_leave_unit: 'day',
				student_leave_value: 1
			} 
		},
		watch: {
			'data':function(data) {
				this.config = util.copy(this.data)
			},
			'modify_type':function(type) {
				if(type=='leave') {
					this.init_leave()
				}
			}
		},
		computed: {
			sale_roles() {
				return this.$store.state.gvars.dicts.sale_role
			},
			level_define() {
				let ret = []
				for(let i=0;i<this.config.member.max_level+1;i++) {
					ret.push({
						name: '',
						amount: 0,
						discount: 100
					})
				}
				return ret
			}
		},
		methods: {
			disabledLessonType (val) {
				let list = this.config.lesson.enable_lesson_type
				let result = list.length == 1 && list[0] == val
								
				return result
			},
			disabledPrintTpls(val){
				let list = this.config.system.enable_print_tpls
				let result = list.length == 1 && list[0] == val			
				return result
			},
			ok() {
				let [method,uri] = (this.config_id?['put','configs/'+this.config_id]:['post','configs']),
					params = {
						cfg_name: 'params',
						cfg_value: this.config
					},
					configs = 'configs'

				if(this.cfgBid) {
					params.bid = this.cfgBid
					configs = 'b'+configs
				}				
				this.loading = true
				this.$http[method](uri,params)
				.then(response=>{
					this.loading = false
					this.$Message.success('修改成功')
					this.$store.dispatch('updateGlobalVar',configs)
					this.$emit('save')
					this.close()
				})
				.catch(response=>{
					this.loading = false
					this.error(response.body.message)
				})
			},
			init_leave() {
				if(this.config.student_leave.minutes_before >= 1440){
					this.student_leave_unit = 'day'
					this.student_leave_value = this.config.student_leave.minutes_before/1440
				}else{
					this.student_leave_unit = 'min'
					this.student_leave_value = this.config.student_leave.minutes_before
				}
			},
			leaveUnitChange(value) {
				if(this.student_leave_unit=='day') {
					this.config.student_leave.minutes_before = this.student_leave_value*24*60
				}else{
					this.config.student_leave.minutes_before = this.student_leave_value
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
			maxLevelChange(value) {
				let level_len = this.config.member.level.length
				if(level_len > value + 1) {
					this.config.member.level.splice(value+1,level_len-value-1)
				}else{
					for(let i=0;i<value+1-level_len;i++) {
						this.config.member.level.push({
							name: '',
							amount: 0,
							discount: 100
						})
					}
				}
			},
			maxTeacherLevelChange(value) {
				let level_len = this.config.teacher_level.level.length
				if(level_len > value + 1) {
					this.config.teacher_level.level.splice(value+1,level_len-value-1)
				}else{
					for(let i=0;i<value+1-level_len;i++) {
						this.config.teacher_level.level.push({
							name: ''
						})
					}
				}
			},
			setLeaveLimitBylesson() {
				this.$Modal.open('system/configs/params/lesson-leave.vue@modal')
				.then(modal => {
					modal.show('按课程设置请假次数')
				})
			},
			setLeaveLimitByStudent() {
				this.$Modal.open('system/configs/params/student-leave.vue@modal')
				.then(modal => {
					modal.show('按学员设置请假次数')
				})
			},
			lessonBkLimit() {
				this.$Modal.open('system/configs/params/lesson-bk.vue@modal',{
					props: {
						'limit-type':this.config.course_arrange.bk_lesson_limit
					}
				})
				.then(modal => {
					modal.show(this.config.course_arrange.bk_lesson_limit==1?'可预约课程':'不可预约课程')
				})
			},
			lessonSpaceLimit() {
				this.$Modal.open('system/configs/params/lesson-space.vue@modal')
				.then(modal => {
					modal.show('预约间隔天数设置')
				})
			}
		}
	}
</script>