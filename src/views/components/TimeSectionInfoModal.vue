<template>
	<Modal v-drag-modal :mask-closable="false" width="480" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<template v-if="modal$.show">
	        <Form :label-width="120" class="mt-3" ref="form" :model="info" :rules="rules">
	        	<Form-item label="期段">
	        		<span>{{season|season_name}}</span>
	        	</Form-item>
				<Form-item label="星期" prop="week_day">
	        		<RadioGroup v-model="week_day_text" type="button">
				        <Radio label="一"></Radio>
				        <Radio label="二"></Radio>
				        <Radio label="三"></Radio>
				        <Radio label="四"></Radio>
				        <Radio label="五"></Radio>
				        <Radio label="六"></Radio>
				        <Radio label="日"></Radio>
				    </RadioGroup>
	        	</Form-item>
	        	<Form-item label="开始时间" prop="int_start_hour">
	        		<Row>
	        			<Col span="8">
	        				<Time-picker confirm @on-change="setIntStartHour" style="width:80px" size="small" :value="info.int_start_hour" format="HH:mm" :steps="[1,15,15]" placeholder="00:00"></Time-picker>
	        			</Col>
	        			<Col span="6">
	        				<Select @on-change="setIntEndHourByTimelong" size="small" style="width:80px;">
						        <Option v-for="item in timelong" :value="item.name" :key="item.name">{{ item.desc }}</Option>
						    </Select>
	        			</Col>
	        		</Row>
	        	</Form-item>
	        	<Form-item label="结束时间" prop="int_end_hour">
	        		<Time-picker confirm @on-change="info.int_end_hour = $event" style="width:80px" size="small" :value="info.int_end_hour" format="HH:mm" :steps="[1,15,15]" placeholder="00:00"></Time-picker>
	        	</Form-item>
	        	<Form-item label="时间段命名" prop="name">
	        		<Input v-model="info.name" placeholder="简短命名" style="width:120px;"></Input>
	        	</Form-item>
	        	           	          		
	        </Form>            
	    </template>
	    <div slot="footer">
            <Button type="ghost" :disabled="saving" @click="close">取消</Button>
            <Button type="primary" :loading="saving" @click="beforeSave">确定</Button>
        </div>
	</Modal>
</template>
<script>
const WEEK_DAY_MAP = ['一','二','三','四','五','六','日']
const INFO_NAME    = '时间段'
const INFO_URL     = 'time_sections'
const INFO_PK_ID   = 'tsid'

import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import modal from '@/libs/modal.mixin'
import util from '@/libs/util'
import {oneOf} from '@/libs/util'

export default {
	name:'TimeSectionInfoModal',
	mixins:[common,globals,modal],
	props:{
		bid:{
			type:Number,
			default:0
		},
		season:{
			type:String,
			default: '',
            validator (value) {
                return oneOf(value, ['','F','X','C', 'Q', 'S','H','A']);
            }

		},
		weekDay:{
			type:[String,Number],
			default:1
		}
	},
	data(){
		return {
			week_day_text:'一',
			info:{
				week_day:1,
				int_start_hour:'',
				int_end_hour:'',
				name:'',
				bid:0,
				time_index:0,
				season:'C'
			},
			rules: {
				week_day:[
					{type:'number', required: true,message:'请选择星期' }
				],
				int_start_hour: [
					{type:'string', required: true, pattern: /^\d{2}:\d{2}$/,message:'请输入开始时间', trigger: 'blur' }
				],	
				int_end_hour: [
					{type:'string', required: true, pattern: /^\d{2}:\d{2}$/,message:'请输入开始时间', trigger: 'blur' }
				],
				name:[
					{type:'string',max:16,message:'命名尽量简短16个字符以内',trigger:'blur'}
				]
			}
		}
	},
	watch:{
		weekDay(week_day){
			this.week_day_text = this.weekDayText(week_day)
		},
		week_day_text(val){
			this.info.week_day = this.week_day_value(val)
		},
		season(val){
			this.info.season = val
		}
	},
	methods:{
		weekDayText(week_day){
			return WEEK_DAY_MAP[week_day-1]
		},
		week_day_value(week_day_text){
			let week_day = 0
			for(let i = 0;i<7;i++){
				if(WEEK_DAY_MAP[i] == week_day_text){
					week_day = i+1
					break;
				}
			}
			return week_day
		},
		setIntStartHour($event){
			this.info.int_start_hour = $event
			this.autoInputName()
		},
		setIntEndHour($event){
			this.info.int_end_hour = $event
			this.autoInputName()
		},
		setIntEndHourByTimelong(minute){
			if(this.info.int_start_hour == ''){
				this.$Message.error('请先输入开始时间')
				return false
			}
			let minutes = util.int(minute)
			this.info.int_end_hour = util.int_hour_add_minutes(this.info.int_start_hour,minutes)
			this.autoInputName()
		},
		autoInputName(){
			if(this.info.int_start_hour == '' || this.info.int_end_hour == ''){
				return
			}
			this.info.name = util.sprintf('%s~%s',this.info.int_start_hour,this.info.int_end_hour)
		},
		beforeSave(){
			this.info.season = this.season
			this.save()
		}
	},
	computed:{
		timelong(){
			return this.$store.state.gvars.dicts['timelong']
		},
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