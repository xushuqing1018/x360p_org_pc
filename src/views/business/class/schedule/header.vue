<style lang="less">
.schedule-header{
	height:90px;
	table{
		width:100%;
		border-collapse:collapse;
		th{
			padding:3px;
			background:#f2f2f2;
			border:1px solid #f2f2f2;
			text-align:center;
		}
		td{
			text-align:center;
			padding:5px 3px;
			border:1px solid #f2f2f2;
		}
	}
}
.ys-wrap{
	position:relative;
	padding-left:32px;
	padding-right:32px;
	text-align:center;
	.prev{
		position:absolute;
		top:0;
		left:5px;
		cursor:pointer;
	}
	.next{
		position:absolute;
		top:0;
		right:5px;
		cursor:pointer;
	}
}
</style>
<template>
<div class="schedule-header">
	<table>
		<thead>
			<tr>
				<th>校区</th>
				<th width="80">年份</th>
				<th width="60">期段</th>
				<th>课程</th>
				<th>科目</th>
				<th>教师</th>
				<th>教室</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>{{bid|branch_name}}</td>
				<td>
					<DatePicker :value="toString(year)" @on-change="yearChange($event)" format="yyyy" type="year" placeholder="选择年份"></DatePicker>
				</td>
				<td>
					<Select v-model="model_season">
        				<Option v-for="item in seasons" :value="item.name">{{item.title}}</Option>
        			</Select>
				</td>
				<td>
					<Tag type="border" closable color="blue" v-if="conditions.lessons.current.id != 0" closable @on-close="clearCondition('lessons')">{{conditions.lessons.current.name}}</Tag>
					<span class="empty" v-else>未选择</span>
				</td>
				<td>
					<Tag type="border" closable color="blue" v-if="conditions.subjects.current.id != 0" closable @on-close="clearCondition('subjects')">{{conditions.subjects.current.name}}</Tag>
					<span class="empty" v-else>未选择</span>
				</td>
				<td>
					<Tag type="border" closable color="blue" v-if="conditions.teachers.current.id != 0" closable @on-close="clearCondition('teachers')">{{conditions.teachers.current.name}}</Tag>
					<span class="empty" v-else>未选择</span>
				</td>
				<td>
					<Tag type="border" closable color="blue" v-if="conditions.classrooms.current.id != 0" closable @on-close="clearCondition('classrooms')">{{conditions.classrooms.current.name}}</Tag>
					<span class="empty" v-else>未选择</span>
				</td>
			</tr>
		</tbody>
	</table>
</div>
</template>
<script>
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import {oneOf} from '@/libs/util'
import util from '@/libs/util'
export default {
	name:'scheduleHeader',
	mixins:[common,globals],
	props:{
		bid:{
			type:Number,
			default:0
		},
		year:{
			type:Number,
			default:0
		},
		season:{
			type:String,
			default:'Q',
			validator(value){
				return oneOf(value,['C','S','Q','H','A'])
			}
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
                return oneOf(value, ['view','edit']);
            }
		},
		conditions:{
			type:Object,
			default(){
				return {}
			}
		}
	},
	data(){
		return {
			model_season: this.season
		}
	},
	watch:{
		model_season(value){
			this.$emit('on-season-change',value)
		}
	},
	methods:{
		clearCondition(c){
			this.conditions[c].current.id = 0
			this.conditions[c].current.name = ''
		},
		yearChange(year){
			this.$emit('on-year-change',util.int(year))
		}
	},
	computed:{
	    seasons(){
	    	return this.$store.state.gvars.dicts.season
	    }
	}
}
</script>