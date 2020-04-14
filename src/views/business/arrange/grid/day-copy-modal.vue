<template>
	<Modal v-drag-modal :mask-closable="false" width="600" v-model="modal$.show" :title="modal$.title" @on-cancel="cancel">
			<Form ref="form" :label-width="100" :model="info">
				<Form-item label="校区:">
					{{bid$|branch_name}}
				</Form-item>
				<Form-item label="源日期:">
					{{dateText}}
				</Form-item>
				<Form-item prop="int_day" label="目标日期:">
		            <Date-picker 
			            type="date"
			            :show-week-numbers="true"
			            :value="info.int_day"
			            @on-change="info.int_day = $event"
			            format="yyyy-MM-dd"
			            placeholder="选择日期"
			            :options="int_day_option"
						:show-week-label="true"
			            >
		            </Date-picker>
				</Form-item>	
			</Form>
		<div slot="footer">
			<span class="text-orange">提示：源日期当天的所有排课(不包括试听及预约)将全部复制到目标日期</span>
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="save" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>
<script>

import moment from 'moment'
import util,{_} from '@/libs/util'
import modal from '@/libs/modal.mixin'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'


export default{
	name:'dayCopyModal',
	mixins:[modal,common,globals],
	props:{
		date:{
			type:Date
		}
	},
	data () {
		return {
			info:{
				int_day:''
			}
			
		}
	},
	mounted(){
		this.info.int_day = moment(this.date).add(1,'days').format('YYYY-MM-DD')
	},
	computed:{
		dateText(){
			return moment(this.date).format('YYYY-MM-DD')
		},
		int_day_option() {
    		let disabledDate = {
    			disabledDate: date=> {
    				return date.valueOf() < this.date.getTime() - 86400000
    			}
			}
        	
        	return disabledDate
        },
	},
	methods:{
		cancel () {
			this.close()
		},
		save () {
			this.$rest('course_arranges')
			.add_url_param(0,'daycopy')
			.post({
				src_int_day:moment(this.date).format('YYYYMMDD'),
				dst_int_day:moment(this.info.int_day).format('YYYYMMDD')
			})
			.success(response=>{
				this.$Message.success(response.data)
				this.$emit('on-success',this.info.int_day)
				this.close()
			})
			.error(response=>{
				this.error(response.body.message)
			})
		}	
	}
}
</script>
