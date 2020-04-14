<template>
	<Modal v-drag-modal :mask-closable="false" width="480" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<template v-if="modal$.show">
        	<Form :label-width="100" ref="form" :model="info" :rules="rules">
        		<Form-item prop="subject_name" label="科目名称">
        			<Input type="text" v-model="info.subject_name" placeholder="科目名称"></Input>
        		</Form-item>
        		<Form-item prop="pj_id" label="所属项目" v-if="this.enable_project">
					<Select style="width:200px" placeholder="项目" v-model="info.pj_id">
          				<Option v-for="item in projects" :value="item.pj_id" :key="item.pj_id">
								{{item.pj_name}}
						</Option>
        			</Select>	       			
        		</Form-item>						
        		<Form-item prop="short_desc" label="科目描述">
        			<Input type="text" v-model="info.short_desc" placeholder="科目描述"></Input>
        		</Form-item>
        		<!--
        		<Form-item prop="unit_price" label="课时单价">
        			<InputNumber v-model="info.unit_price"></InputNumber> 元/课时
        		</Form-item>
        		<Form-item prop="per_lesson_hour_minutes" label="单课时分钟">
        			<Input-number :step="1" :min="0" v-model="info.per_lesson_hour_minutes" v-tabindex="-1" style="width:50px;"></Input-number>  分钟
        		</Form-item>
        		-->
        	</Form>
        </template>
	    
    	<div slot="footer">
            <Button type="ghost" @click="close">取消</Button>
            <Button type="primary" @click="checkForm">确定</Button>
        </div>
    </Modal>
</template>

<script>
	import Vue from 'vue'
	import moment from 'moment'
	import store from '@/store'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import directive from '@/libs/directive.mixin'
	import SearchModal from 'c%/SearchModal'
	import SelectLesson from 'c%/SelectLesson'
	import SelectEmployee from 'c%/SelectEmployee'
	import SeasonSchedule from 'c%/SeasonSchedule'
	import SelectClassRoom from 'c%/SelectClassRoom'
	
	const INFO_NAME = '科目'
	const INFO_PK_ID = 'sj_id'
	const INFO_URL   = 'subjects'

	const emptyObject = {
		sj_id: 0,
		subject_name: '',
		subject_desc: '',
		unit_price: 0,
		per_lesson_hour_minutes:0,
		pj_id:0
	}
	
	export default{
		name:'subjectInfoModal',
		mixins:[modal,common,directive,globals],
		data () {
			return {
				info: util.copy(emptyObject),
				rules: {
					subject_name: [
						{ required: true, message:'请输入科目名称', trigger: 'blur' }
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
        	checkForm(){
        		if(this.info.subject_name == ''){
            		this.$Message.error('请输入科目名称!')
            		return false           	
            	}

            	if(this.enable_project){
            		if(this.info.pj_id == 0){
            			this.$Message.error('请选择所属项目')
            			return false
            		}
            	}

            	this.save()
            	
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
		    }
		}
	}
</script>
