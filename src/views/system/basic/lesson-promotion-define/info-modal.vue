<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="550">
		<Form ref="form" :model="info" :label-width="80">
			<Form-item label="优惠名称" prop="title" class="custom-form-item-required">
				<Input v-model="info.title" style="width: 250px" placeholder="请输入"></Input>
			</Form-item>
			<Form-item label="适用对象">
				<RadioGroup v-model="type_range" type="button">
					<Radio :label="1">按课程</Radio>
					<Radio :label="2">按科目</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="适用课程" prop="suit_lids" v-if="type_range==1" class="custom-form-item-required">
				<select-lesson 
					v-model="info.suit_lids" 
					clearable 
					style="width: 250px"
					>
				</select-lesson>
			</Form-item>
			<Form-item label="适用科目" prop="suit_sj_ids" v-else class="custom-form-item-required">
				<select-subject 
					v-model="info.suit_sj_ids" 
					clearable 
					style="width: 250px"
					>
				</select-subject>
			</Form-item>
			<Form-item label="优惠类型" prop="promotion_type" class="custom-form-item-required">
				<Select v-model="info.promotion_type" style="width: 250px">
					<Option :value="index+1" v-for="(value,key,index) in promotion_type_list">{{value}}</Option>
				</Select>
			</Form-item>
			<Form-item label="优惠数值" prop="promotion_value" class="custom-form-item-required">
				<template v-if="info.promotion_type==2">
					<span>满</span>
					<InputNumber v-model="info.valve" :min="info.promotion_value"></InputNumber>
					<span>减</span>
				</template>
				<InputNumber v-model="info.promotion_value" :min="1" :max="max_value"></InputNumber>
				<span v-if="info.promotion_type==1">%</span>
				<span v-else-if="info.promotion_type==4">个</span>
				<span v-else-if="info.promotion_type==2||info.promotion_type==3">元</span>
			</Form-item>
			<Form-item label="额外赠送" prop="present_lesson_hours" v-if="info.promotion_type<4">
				<InputNumber v-model="info.present_lesson_hours" :min="0"></InputNumber> 课时
			</Form-item>
			<Form-item label="适用校区" prop="suit_bids" class="custom-form-item-required" >
				<select-branch 
					v-model="info.suit_bids" 
					clearable 
					:disabled="info.is_public==1" 
					style="width: 250px"
					>
				</select-branch>
				<Checkbox 
					class="ml-2" 
					v-model="info.is_public" 
					:true-value="1" 
					:false-value="0"
					@on-change="changePublic" 
					>
					适用所有校区
				</Checkbox>
			</Form-item>
			<Form-item label="有效期" class="custom-form-item-required">
				<DatePicker 
					:value="info.start_time" 
					type="datetime"
					@on-change="info.start_time=$event" 
					style="width: 160px"
					placeholder="开始时间"
					>
				</DatePicker>
				   ~   
				<DatePicker 
					:value="info.end_time" 
					type="datetime"
					@on-change="info.end_time=$event" 
					style="width: 160px"
					placeholder="结束时间"
					>
				</DatePicker>
			</Form-item>
			<Form-item label="状态">
				<i-switch v-model="info.status" :true-value="1" :false-value="0">
					<span slot="open">开</span>
					<span slot="close">关</span>
				</i-switch>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close" :disabled="saving">关闭</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectBranch from 'c%/SelectBranch.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectSubject from 'c%/SelectSubject.vue'

	const INFO_NAME  = '优惠折扣'
	const INFO_PK_ID = 'pr_id'
	const INFO_URL   = 'promotion_rules'

	const emptyObj = {
		title: '',
		promotion_type: 0,
		is_fixed: 0,
		valve: 0,
		promotion_value: 0,
		is_public: '',
		suit_bids: [],
		suit_lids: [],
		suit_sj_ids: [],
		start_time: '',
		end_time: '',
		status: 1,
		present_lesson_hours: 0 //同时赠送
	}

	export default {
		mixins: [modal,common],
		components: {
			SelectBranch,
			SelectLesson,
			SelectSubject
		},
		data() {
			return {
				type_range: 1,
				info: util.copy(emptyObj)
			}
		},
		computed: {
			info_url$(){
            	return INFO_URL
	        },
	        info_name$(){
	            return INFO_NAME
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
	        },
	        max_value() {
	        	if(this.info.promotion_type==2) {
	        		return this.info.valve
	        	}else if(this.info.promotion_type==1) {
	        		return 100
	        	}
	        	return 10000
	        }
		},
		methods: {
			onModalOpen() {
				
			},
			changePublic(v) {
				if(v) {
					this.info.suit_bids.splice(0)
				}
			},
			ok() {
				if(this.info.title === '') {
					this.$Message.error('请输入优惠名称')
					return
				}
				if(this.info.suit_lids.length == 0 
					&& this.info.suit_sj_ids.length == 0
					) {
					this.$Message.error('请选择优惠对象')
					return
				}
				if(this.info.promotion_type == 0) {
					this.$Message.error('请选择优惠类型')
					return
				}
				if(this.info.promotion_value == 0) {
					this.$Message.error('请选择优惠数值')
					return
				}
				if(this.info.promotion_type == 2) {
					if(this.info.valve == 0) {
						this.$Message.error('请重新选择满减规则')
						return
					}
					if(this.info.valve < this.info.promotion_value) {
						this.$Message.error('请重新选择满减规则')
						return
					}
				}
				if(this.info.is_public==0&&this.info.suit_bids.length==0) {
					this.$Message.error('请选择适用校区')
					return
				}
				if(new Date(this.info.end_time).getTime() < new Date(this.info.start_time).getTime()) {
					this.$Message.error('请重新选择有效期')
					return
				}
				this.save()
			},
			save() {
				let method = this.modal$.action == 'add'?'post':'put'
                let action = this.modal$.action == 'add'?'添加':'编辑'
                let $rest  = this.$rest(this.info_url$)
                if(this.modal$.action != 'add'){
                    $rest.add_url_param(this.info[this.info_pk_id$])
                }else{
                    if(this.info && this.info_pk_id$ && this.info[this.info_pk_id$]){
                        delete this.info[this.info_pk_id$]
                    }
                }
                $rest[method](this.info)
                .success(response=>{
                    this.$Message.success(util.sprintf('%s%s成功!',this.info_name$,action))
                    this.$emit('save',{action:this.modal$.action,data:this.info})
                    this.close()
                })
                .error(response=>{
                    this.error(response.body.message)
                })
			}
		}
	}
</script>