<template>
	<Modal v-drag-modal :mask-closable="false" width="480" v-model="modal$.show" :title="modal$.title">
		<template v-if="modal$.show">
        	<Form :label-width="100" ref="form" :model="info" :rules="rules">
        		<Form-item prop="exam_name" label="考试名称">
        			<Input type="text" v-model="info.exam_name"></Input>
        		</Form-item>
        		<Form-item prop="exam_type_did" label="考试类型">
        			<Select v-model="info.exam_type_did" :clearable="true">
                        <Option v-for="item in dicts('exam_type')" :value="item.did">{{item.title}}</Option>
                    </Select>
        		</Form-item>
        		<Form-item prop="exam_int_day" label="考试时间">
        			<DatePicker 
						type="date" 
						:value="format_day(info.exam_int_day)" 
						@on-change="info.exam_int_day = $event"
						clearable>
					</DatePicker>
        		</Form-item>
        		<Form-item prop="exam_subject_dids" label="考试科目">
        			<Select v-model="info.exam_subject_dids" multiple>
                        <Option v-for="item in dicts('exam_subject')" :value="String(item.did)">{{item.title}}</Option>
                    </Select>
        		</Form-item>
        		<Form-item prop="score_release_int_day" label="成绩发布时间">
        			<DatePicker 
	        			type="date" 
	        			:value="format_day(info.score_release_int_day)" 
	        			@on-change="info.score_release_int_day = $event" 
	        			clearable>
        			</DatePicker>
        		</Form-item>
        		<Form-item prop="remark" label="备注">
        			<Input type="text" v-model="info.remark"></Input>
        		</Form-item>
        	</Form>
        </template>
    	<div slot="footer">
            <Button type="ghost" @click="close">取消</Button>
            <Button type="primary" @click="save" :loading="saving">确定</Button>
        </div>
    </Modal>
</template>

<script>
	import Vue from 'vue'
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	const INFO_NAME = '考试'
	const INFO_PK_ID = 'se_id'
	const INFO_URL   = 'student_exams'

	const emptyObject = {
		se_id: 0,
		exam_name: '',
		exam_type_did: -1,
		exam_int_day: '',
		exam_subject_dids: [],
		score_release_int_day: '',
		remark: ''
	}
	
	export default{
		name:'examInfoModal',
		mixins:[modal,common],
		data () {
			return {
				info: util.copy(emptyObject),
				rules: {
					exam_name: [
						{ required: true, type: 'string', message:'请输入考试名称', trigger: 'blur' }
					],
					exam_type_did: [
						{ required: true, type: 'number', message:'请选择考试类型', trigger: 'change' }
					],
					exam_subject_dids: [
						{ required: true, type: 'array', message:'请添加考试科目', trigger: 'change' }
					]
				}
			}
		},
		watch: {
			'modal$.show': function(val) {
            	if(val&&this.modal$.action == 'add'){
					this.info = util.copy(emptyObject)
				}	            
	        }
        },
        methods: {
        	       	
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
	        }

		}
	}
</script>
