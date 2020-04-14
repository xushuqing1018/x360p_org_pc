<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="600">
		<Form :label-width="80">
			<Form-item label="承诺到访" prop="is_promise">
				<Checkbox v-model="followup.is_promise" :true-value="1" :false-value="0"></Checkbox>
			</Form-item>
			<template v-if="followup.is_promise">
			<Form-item label="意向级别" prop="intention_level">
				<Rate v-model="followup.intention_level"></Rate>
			</Form-item>	
			<Form-item label="诺到访日" prop="promise_int_day" >
				<DatePicker 
					type="date" 
					:value="followup.promise_int_day" 
					:options="disabledOptions"
					@on-change="followup.promise_int_day=$event" 
					placeholder="选择日期" 
					style="width: 200px"
					>
				</DatePicker>
			</Form-item>
			<Form-item label="诺到访类型" prop="promise_did">
				<Select v-model="followup.promise_did">
					<Option :value="item.did" :key="index" v-for="(item,index) in dicts('promise')">{{item.title}}</Option>	
				</Select>
			</Form-item>
			</template>
			<Form-item label="安排试听"  prop="is_audition" v-if="followup.is_promise">
				<Checkbox v-model="is_audition" :true-value="1" :false-value="0"></Checkbox>
			</Form-item>
			<Form-item label="试听课" v-if="followup.is_promise && is_audition">
				<div class="x-multiple-select-container">
					<div class="x-multiple-select">
						<p>授课对象：{{teachObject}}</p>
						<p>上课日期：{{course_arrange.int_day|int_date}}</p>
						<p>上课时段：{{course_arrange.int_start_hour|int_hour}}--{{course_arrange.int_end_hour|int_hour}}</p>
						<p>教室：{{course_arrange.cr_id|classroom_name('未知')}}</p>
						<i style="top:0" class="ivu-icon ivu-icon-ios-close ivu-input-icon ivu-input-icon-clear ivu-input-icon-normal" @click="clearClass"></i>
					</div>
					<div class="x-multiple-select-after">
						<Dropdown class="x-drop-menu">
							<Button type="ghost" icon="arrow-down-b">请选择</Button>		        
					        <DropdownMenu slot="list">
					            <DropdownItem @click.native="showArrange(0)">跟班试听</DropdownItem>
					            <DropdownItem @click.native="addTrialArrange">新开试听课</DropdownItem>
					            <DropdownItem @click.native="showArrange(1)">已有试听课</DropdownItem>
					        </DropdownMenu>
					    </Dropdown>
					</div>
				</div>
			</Form-item>
			<Form-item label="忽略冲突" v-if="followup.is_promise && is_audition">
				<template v-if="!course_arrange.ca_id">
					<Checkbox v-model="ignore.ignore_class_cc" :true-value="1" :false-value="0">忽略教室冲突</Checkbox>
					<Checkbox v-model="ignore.ignore_class_ec" :true-value="1" :false-value="0">忽略老师冲突</Checkbox>
				</template>
				<Checkbox v-model="ignore.ignore_student_cc" :true-value="1" :false-value="0">忽略学员冲突</Checkbox>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<div class="pull-left">
				<span>已选择：
					<span class="text-info">{{num}}人</span>
				</span>
				<Checkbox v-model="is_push" v-if="followup.is_promise && is_audition" style="margin-left:10px;">
					<span class="text-info">推送微信消息给上课{{'老师'|translate}}</span>
				</Checkbox>
			</div>
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	
	export default{
		mixins: [ common, modal, globals],
		data () {
			return {
				params: {},
				ids: [],
				num: 0,
				is_push: true,
				followup:{
					is_connect: 1,
					intention_level: 0,
					followup_did: 122,
					is_promise: 0,
					promise_did: 0,
					promise_int_day: '',
					content: '',
				},
				disabledOptions: {
					disabledDate (date) {
              return date && date.valueOf() < Date.now() - 86400000;
          }
				},
				is_audition: 0,
				course_arrange: {},
				ignore: {
					ignore_student_cc:0,
					ignore_class_cc:0,
					ignore_class_ec:0
				},
				info: {}
			}
		},
		watch: {
		},
		computed: {
			teachObject() {
				let ca = this.course_arrange
				let result = '-'
				if(!_.isEmpty(ca)){
					if(ca.cid){
						result = ca.one_class.class_name
					}else if(ca.name){
						result = ca.name
					}else{
						let ret = []
						ca.students.forEach(s=>{
							if(s.student){
								ret.push(s.student.student_name)
							}else if(s.customer){
								ret.push(s.customer.name)
							}
						})

						result = ret.join(',')

						if(ca.lesson_type == 1){
							result = '1对1:'+result
						}else if(ca.lesson_type == 2){
							result = '1对多:'+result
						}
					}
				}				
				return result
			},
		},
		methods: {
			clearClass () {
				this.course_arrange = {}
			},
			showArrange(t) {
				this.$Modal.open('recruiting/audition/select-arrange.vue@modal',{
					props: {
						'is-trial':t
					},
					on: {
						'on-select':(row) => {
							this.chooseArrange(row)
						}
					}
				})
				.then(modal => {
					modal.show(t?'选择已有试听课':'选择已有排课')
				})
			},
			chooseArrange (ca) {
				this.course_arrange = ca
			},
			addTrialArrange() {
				this.$Modal.open('recruiting/audition/trial-info-modal',{
					on: {
						'on-save-success':(data) => {
							this.chooseArrange(data)
						}
					}
				})
				.then(modal =>{
					modal.show('添加试听课','select')
				})
			},
			
			init_param () {
				let params = {
					is_push: this.is_push,
					course: {}
				}
				let course_arrange = this.course_arrange
				
				params.course = {
					lid: course_arrange.lid,
					sj_id: course_arrange.sj_id,
					cr_id: course_arrange.cr_id,
					int_day: course_arrange.int_day,
					int_start_hour: course_arrange.int_start_hour,
					int_end_hour: course_arrange.int_end_hour,
					second_eid: course_arrange.second_eid,
					second_eids: course_arrange.second_eids
				}

				if(course_arrange.ca_id){
					params.course.ca_id = course_arrange.ca_id
					params.course.eid = course_arrange.teach_eid
					if(course_arrange.cid){
						params.course.cid = course_arrange.cid
					}
					params.course.ignore_student_cc = this.ignore.ignore_student_cc
				}else{
					params.course.teach_eid = course_arrange.teach_eid
					params.course.name = course_arrange.name
					params.course.is_trial = 1
					params.course.ignore_class_cc = this.ignore.ignore_class_cc
					params.course.ignore_class_ec = this.ignore.ignore_class_ec
					params.course.ignore_student_cc = this.ignore.ignore_student_cc
				}

				if(course_arrange.start_day){
					params.course.start_day = course_arrange.start_day
					params.course.end_day = course_arrange.end_day
				}
				if(course_arrange.student_limit){
					params.course.student_limit = course_arrange.student_limit
				}
				
				return params
      },
      transferToCustomer(ids) {
			  this.$rest('market_clues/change_to_customer').post({
					mcl_ids:ids,
					info: this.info
					})
			  .success(data=>{
					this.$Message.success('转化成功！')
					this.$emit('on-success')
					this.close()
			  }).error(response=>{
			  	this.error(response.body.message||'操作失败~')
			  })
		  },
			ok () {
				if(this.followup.is_promise){
					if(this.followup.intention_level==0) {
						this.$Message.error('请选择意向级别')
						return
					}
					if(this.followup.is_promise==1&&this.followup.promise_int_day==''){
						this.$Message.error('请选择诺到日期')
						return
					}
					this.info.followup = this.followup
				}
				let params = this.init_param()
				if((this.is_audition&&params) && this.followup.is_promise){
					if(_.isEmpty(this.course_arrange)){
						this.$Message.error('请先选择试听班级')
						return false
					}	
					this.info.trial_listen_arrange = params
				}
        if(this.ids.length !== 0){
          this.transferToCustomer(this.ids)
        }else {
					this.info.params = this.params
          this.$rest('market_clues/change_to_valid').post(this.info)
				  	.success(data=>{
							this.$Message.success('操作成功！')
							this.$emit('on-success')
							this.close()
				  	}).error(response=>{
				  		this.error(response.body.message||'操作失败~')
				  })          
        }
			}
		}
	}
</script>

<style>
</style>