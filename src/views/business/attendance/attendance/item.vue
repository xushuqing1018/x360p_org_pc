<template>
	<tr>
		<td width="90px">
			<div class="ivu-table-cell" v-if="!item.is_attendance">
				<Button type="ghost" @click="del(item)" icon="ios-trash" shape="circle"></Button>
			</div>
		</td>
		<td width="225px">
			<div class="ivu-table-cell">							
				<avatar-and-name 
					style="display: inline-block;" 
					:src="item.student.photo_url" 
					:name="item.student.student_name" 
					:nickname="item.student.nick_name"
					:sex="item.student.sex"
					:sid="item.student.sid"
					:detailAction="2"
					@click="clearAtt"
					v-if="item.sid > 0"
					>
				</avatar-and-name>
				<avatar-and-name 
					style="display: inline-block;" 
					:src="item.customer.photo_url" 
					:name="item.customer.name" 
					:sex="item.customer.sex"
					:cu-id="item.cu_id"
					:detail-action="0"
					@click="clearAtt"
					v-if="item.sid == 0"
					>
				</avatar-and-name>
				<Tag color="red" v-if="item.sid>0&&item.student.status!=1">
					{{ss_map[item.student.status].text}}
				</Tag>
				<Tag :color="item.is_trial?'yellow':(item.is_makeup?'#EF6AFF':'blue')" v-if="item.is_trial||item.is_makeup">
					<span v-if="item.is_trial">试</span>
					<span v-else-if="item.is_makeup">补</span>
				</Tag>
				<Tag color="green" v-if="item.is_bk==1">约</Tag>
			</div>
		</td>
		<td width="206px">
			<div class="ivu-table-cell">
				<RadioGroup size="small" 
				v-model="item.is_in" 
				type="button" 
				@on-change="attChange($event)">
					<Radio :label="1" :disabled="is_att_disabled">出勤</Radio>
					<Radio :label="0" :disabled="is_att_disabled">缺勤</Radio>
				</RadioGroup>
				<Input class="mt-1" v-model="item.remark" placeholder="缺勤原因" v-if="item.is_in==0 && !item.is_leave"></Input>
			</div>						
		</td>
		<td width="140px">
			<div class="ivu-table-cell" style="width:120px" v-if="item.is_trial != 1 && item.is_makeup != 1">
				<Checkbox 
					v-model="item.is_leave" 
					:true-value="1" 
					:false-value="0" 
					:disabled="is_leave_disabled"
					@on-change="leaveChange($event)">
				</Checkbox>
				<Input 
					class="mt-1" 
					v-model="item.remark" 
					:readonly="is_leave_disabled"
					placeholder="请假理由" 
					v-if="item.is_leave" 
					>
				</Input>
			</div>
		</td>
		<td width="228px">
			<div class="ivu-table-cell">
				<span v-if="item.is_trial">无</span>
				<template v-else>
					<template v-if="item.student.student_lesson.price_type == 3">
						<span v-if="item.student.student_lesson.is_expired ==1" class="text-danger">
							已过期 {{item.student.student_lesson.remain_days}} 天
						</span>
						<span v-else class="text-success">
							还剩 {{item.student.student_lesson.remain_days}} 天
						</span>
					</template>
					<template v-else>
						<Checkbox 
							v-model="item.is_consume" 
							:true-value="1" 
							:false-value="0" 
							:disabled="is_consume_lesson_hour_disabled"
							@on-change="consumeChange($event)"
							>
						</Checkbox>
						<template v-if="arrange.consume_source_type==1">
							<template v-if="item.student&&item.student.student_lesson">
		 						<span 
									:class="item.student.student_lesson.remain_lesson_hours < 2 ? 'text-danger' : ''" 
									>
									剩（{{item.student.student_lesson.remain_lesson_hours}}
									<span class="text-info" v-if="is_makeup_class_ca">{{item.student.student_lesson.lesson_name}}</span>）
								</span>
								<template v-if="item.is_attendance==1">
									<span v-if="item.has_extra_consume" class="text-danger">额外扣{{item.has_extra_consume}}课时</span>
								</template>
								<template v-else>
									<span v-if="item.extra_consume" class="text-danger">额外扣{{item.extra_consume.lesson_hours}}课时</span>
								</template>
								<Icon 
									v-if="enable_extra_consume"
									type="wineglass" 
									:class="[is_consume_lesson_hour_disabled?'not-allow':'cursor','pull-right']"
									:color="color" 
									@click.native="setExtraConsume"
									title="额外课消"
									style="line-height: 1.5">
								</Icon>
							</template>
							<span v-else>无</span>
						</template>
						<template v-else>
							<span 
								:class="Number(item.student.money) < consumeLessonAmount ? 'text-danger' : ''" 
								>
								{{label_currency}}{{Number(item.student.money)}}
							</span>
							<Icon 
								type="compose" 
								class="resetMoney" 
								size='13' 
								@click="resetMoney" 
								v-if="!isReset&&!is_consume_lesson_hour_disabled"
								>
							</Icon>
							<br>
							<span v-if="isReset">
								扣<InputNumber 
									style="margin-left:10px;margin-right:10px;"
									:value="item.reset_val"
									@on-change="item.reset_val = $event" 
									placeholder="扣余额"
									:min="0">
								</InputNumber>
								<Icon 
									type="close-circled" 
									style="cursor: pointer;" 
									@click="cancelResetMoney" 
									size='13' 
									v-if="isReset">
								</Icon>
							</span>
						</template>						
					</template>
				</template>
				<span v-if="show_expire_day && item.student && item.student.student_lesson && item.student.student_lesson.expire_time != 0" title="剩余课时有效期">( {{item.student.student_lesson.expire_time | date}} )</span>
			</div>
		</td>
	</tr>
</template>
<script>
	import util,{_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	
	export default{
		mixins: [ common ],
		props: {
			item: {
				type: Object,
				default: ()=>{
					return {}
				}
			},
			arrange:{
				type:Object,
				default:()=>{
					return {}
				}
			},
			caId: {
				type: [String,Number],
				default: 0
			},
			lessonType: {
				type: [String,Number],
				default: 0
			},
			teachEid: {
				type: Number,
				default: 0
			},
			consumeLessonHour: {
				type: [Number,String],
				default: 0
			},
			consumeLessonAmount: {
				type: [Number,String],
				default: 0
			}
		},
		data () {
			return {
				name: '',
				all: {
					is_in: false,
					is_comsume: false,
					is_leave: false
				},
				color: '#5c6b77',
				isReset: false
			}
		},
		mounted() {
			if(this.item.has_extra_consume > 0) {
				this.color = '#19be6b'
			}
			this.isReset = this.item.is_reset
		},
		computed: {
			not_price_type3(){
				if(this.item.sid > 0 && this.item.student && this.item.student.student_lesson.price_type == 3){
					return false
				}
				return true
			},
			is_att_disabled(){
				if(this.item.is_trial == 0 && this.item._disabled){
					return true
				}
				if(this.item.is_attendance == 1 
					|| (!_.isEmpty(this.item.student) 
						&& this.item.student.status != 1)
					|| (!_.isEmpty(this.item.student.student_lesson) 
						&& this.item.student.student_lesson.price_type == 3
						&& this.item.student.student_lesson.is_expired == 1)
				){
					
					return true
				}
				return false
			},
			is_leave_disabled(){				
				if(this.item.is_trial == 1 || this.item.is_makeup == 1){
					return true
				}else{
					if(this.item._disabled){
						return true
					}
				}
				if(this.item.is_attendance == 1 
					|| (!_.isEmpty(this.item.student) 
						&& this.item.student.status != 1)
					|| (!_.isEmpty(this.item.student.student_lesson) 
						&& this.item.student.student_lesson.price_type == 3)
				){
					return true
				}
				return false
			},
			is_consume_lesson_hour_disabled(){
				if(this.item.is_attendance == 1 
					|| (this.item.student&&this.item.student.status != 1)
					|| this.item._disabled_consume
					){
					return true
				}
				return false
			},
			is_makeup_class_ca(){

				if(this.arrange && this.arrange.one_class && this.arrange.one_class.class_type == 1){
					return true
				}
				return false
			}
		},
		methods: {
			cancelResetMoney() {
				this.isReset = false;
				this.item.is_reset = false
			},
			resetMoney() {
				this.isReset = true;
				this.item.is_reset = true;
				this.$set(this.item,'is_consume',1)
			},
			getListItem (item) {
				let obj = {}
				if(item.sid>0){			
					obj = item.student||{}
					obj.name = item.student?item.student.student_name:''
				}else{
					obj = item.customer||{}
				}
				return obj
			},
			del(item){
				this.$emit('on-del',item)
			},
			leaveChange(val){
				this.$emit('on-leave-change',{val:val,item:this.item})
			},
			attChange(val){
				this.$emit('on-att-change',{val:val,item:this.item})
			},
			consumeChange(val) {
				this.$emit('on-consume-change',{val:val,item:this.item})
			},
			clearAtt(){
				this.$emit('on-att-clear')
			},
			extra_icon_color(){
				let color = '#5c6b77'
				if(this.item.extra_consume) {
					color = '#19be6b'
				}
				this.color = color
			},
			setExtraConsume() {
				if(this.is_consume_lesson_hour_disabled) {
					return
				}
				this.$Modal.open('business/attendance/attendance/extra-consume-modal.vue',{
					on: {
						'on-cancel':() => {
							delete this.item['extra_consume']
							this.extra_icon_color()
						},
						'on-success':(data) => {
							this.item.extra_consume = data
							this.extra_icon_color()
						}
					},
					props: {
						'consume-lesson-hour': this.consumeLessonHour,
						'remain-lesson-hours': this.item.student.student_lesson.remain_lesson_hours
					}
				})
				.then(modal => {
					if(this.item.extra_consume) {
						modal
						.set('info',this.item.extra_consume)
						.show(util.sprintf('额外课消【%s】',this.item.student.student_name),'edit')
					}else{
						modal
						.set('teach_eid',this.teachEid)
						.show(util.sprintf('额外课消【%s】',this.item.student.student_name),'add')
					}
				})
			}
		}
	}
</script>
<style>
	.cursor {
		cursor: pointer;
	}
	.not-allow {
		cursor: not-allowed;
	}
	.resetMoney {
		margin-left: 15px;
		cursor: pointer;
	}
</style>