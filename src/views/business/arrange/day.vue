<template>
	<td class="arrange-day">
		<template v-if="isHoliday(weekDate.date)">
			<div class="arrange-holiday">
				<p>今天放假!</p>
				<Tag type="border" color="blue">{{holidayReason(weekDate.date)}}</Tag>
			</div>
		</template>
		<template v-else>
			<arrange-cell 
			:bid="bid"
			:year="year"
			:week="week"
			:week-date="weekDate"
			:time-section="ts" 
			:action="action"
			:mode="mode"
			:disable-sections="disableSections" 
			:conditions="conditions" 
			:arranges="arranges"
			:all-arranges="allArranges"
			@on-cell-add="cellAddHandle" 
			@on-cell-edit="cellEditHandle" 
			v-for="ts in dateTimeSections" >
			</arrange-cell>

			<div class="arrange-cell-btn" v-if="mode=='view'">
				<Button v-per="'time.add'" @click="timeSectionAdd" type="ghost" long><Icon type="plus"></Icon></Button>
			</div>
		</template>
	</td>
</template>
<script>
import {oneOf} from '@/libs/util'
import moment from 'moment'
import {_} from '@/libs/util'
import util from '@/libs/util'
import store from '@/store'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import arrangeCell from './cell.vue'

function by(attr,rev){
    //第二个参数没有传递 默认升序排列
    if(typeof rev ==  'undefined'){
        rev = 1;
    }else{
        rev = (rev) ? 1 : -1;
    }
    return function(a,b){
        a = a[attr];
        b = b[attr];
        if(a < b){
            return rev * -1;
        }
        if(a > b){
            return rev * 1;
        }
        return 0;
    }
}

export default {
	name:'arrangeDay',
	mixins:[common,globals],
	components:{
		arrangeCell
	},
	computed:{
		dateTimeSections(){
			let time_sections = []
			let week_day = util.get_week_day(this.weekDate.date)
			let season   = this.conditions.season.value
			let season_time_sections = this.get_time_sections(week_day,season)
			let ts_map = {}
			if(season_time_sections.length > 0){
				season_time_sections.forEach(ts=>{
					ts_map[ts.int_start_hour+'-'+ts.int_end_hour] = 1
				})
			}
			//获取不在期段时间表里面的排课时间段
			let unreg_time_sections = []
			if(this.arranges.length > 0){
				let int_day = util.int(moment(this.weekDate.date).format('YYYYMMDD'))
				this.arranges.forEach(item=>{
					if(item.int_day == int_day){
						let key = util.int_hour_to_hour_str(item.int_start_hour)+'-'+util.int_hour_to_hour_str(item.int_end_hour)
						if(!_.isDefined(ts_map[key])){
							unreg_time_sections.push({
								int_start_hour:util.int_hour_to_hour_str(item.int_start_hour),
								int_end_hour:util.int_hour_to_hour_str(item.int_end_hour),
								week_day:week_day
							})
							ts_map[key] = 1
						}
					}
				})
			}

			time_sections = season_time_sections.concat(unreg_time_sections)

			time_sections.sort(by('int_start_hour'))

			return time_sections
		}
	},
	props:{
		weekDate:{
			type:Object,
			default(){
				return {

				}
			}
		},
		bid:{
			type:Number,
			default:0
		},
		year:{
			type:Number,
			default:0
		},
		week:{
			type:Number,
			default:1
		},
		action:{
			type:String,
			default:'list',
			validator(value){
				return oneOf(value,['list','add','edit'])
			}
		},
		mode:{
			type:String,
			default:'view',
			validator (value) {
                return oneOf(value, ['view','edit','list']);
            }
		},
		conditions:{
			type:Object,
			default(){
				return {}
			}
		},
		arranges:{
			type:Array,
			default(){
				return []
			}
		},
		disableSections:{
			type:Array,
			default(){
				return []
			}
		},
		allArranges:{
			type:Array,
			default(){
				return []
			}
		}
	},
	methods:{
		isHoliday(dt){
			let result = false
			let holidays = this.$store.state.gvars.holidays;
			let date = moment(dt).format('YYYY-MM-DD')
			let bid = this.bid$
			let days = holidays.filter(item=>item.int_day == date && item.bid == bid)
			if(days.length == 0){
				days = holidays.filter(item=>item.int_day == date && item.bid == 0)
			}
			if(days && days.length > 0){
				result = true
			}	
			return result
		},
		holidayReason(dt){
			let name = ''
			let holidays = this.$store.state.gvars.holidays;
			let date = moment(dt).format('YYYY-MM-DD')
			let bid = this.bid$
			let days = holidays.filter(item=>item.int_day == date && item.bid == bid)
			if(days.length == 0){
				days = holidays.filter(item=>item.int_day == date && item.bid == 0)
			}
			if(days && days.length > 0){
				name = days[0].name
			}
			return name
		},
		timeSectionAdd(){
			this.$emit('on-ts-add',this.weekDate)
		},
		cellAddHandle(ts){
			this.$emit('on-cell-add',ts)
		},
		cellEditHandle($event){
			this.$emit('on-cell-edit',$event)
		}
	}
}
</script>