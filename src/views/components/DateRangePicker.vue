<template>
	<Date-picker 
		:transfer="transfer"
		:type="type" 
		:value="value" 
		:size="size" 
		:format="format" 
		confirm 
		:options="date_option" 
		:placeholder="placeholder"
		 @on-change="dateChange" 
		 @on-clear="clear" 
		 @on-ok="ok">
	 </Date-picker>
</template>
<script>
import common from '@/libs/common.mixin'
import util from '@/libs/util'
export default{
	mixins:[common],
	name:'DateRangePicker',
	props:{
		value:{
			type:Array
		},
		label:{
			type:String
		},
        size:{
            type:String
        },
        transfer: {
        	type: Boolean,
        	default: false
        },
        type:{
            type: String,
            default:'daterange'
        },
        format:{
            type: String,
            default:'yyyy-MM-dd'
        }
	},
	methods:{
		dateChange(date_arr){
			this.date_arr = date_arr
			this.$emit('input',date_arr)
			this.$nextTick(() => {
                this.dispatch('FormItem', 'on-form-change', date_arr);
            });
		},
		ok(){
			this.$emit('on-change',this.date_arr)
		},
		clear(){
			this.date_arr[0] = ''
			this.date_arr[1] = ''
			this.$emit('on-change',this.date_arr)
		}
	},
	computed:{
		placeholder(){
			return this.label || '请选择日期'
		}
	},
	data(){
		return {
			date_arr:[],
			date_option: {
                shortcuts: [
                    {
                        text:'今天',
                        value(){
                            return util.today_range_time()
                        }
                    },
                    {
                        text:'本周',
                        value(){
                            return util.week_range_time(1)
                        }
                    },
                    {
                        text:'本月',
                        value(){
                           return util.month_range_time()
                        }
                    },
                    {
                        text:'上周',
                        value(){
                           return util.last_week_range_time()
                        }
                    },
                    {
                        text:'上月',
                        value(){
                           return util.last_month_range_time()
                        }
                    },
                    {
                        text: '最近一周',
                        value () {
                           return util.recent_week_range_time(1)
                        }
                    },
                    {
                        text: '最近一个月',
                        value () {
                            return util.recent_month_range_time(1)
                        }
                    },
                    {
                        text: '最近三个月',
                        value () {
                            return util.recent_month_range_time(3)
                        }
                    }
                ]
            }
		}
	}
}
</script>