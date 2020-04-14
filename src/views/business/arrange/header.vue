<style lang="less">
.arrange-header{
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
	padding-left:15px;
	padding-right:15px;
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
<div class="arrange-header">
	<table>
		<thead>
			<tr>
				<th>校区</th>
				<th width="90">周数</th>
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
					<div class="ys-wrap">
						<span class="prev" @click="prevWeek"><Icon type="chevron-left"></Icon></span>
						<span class="next" @click="nextWeek"><Icon type="chevron-right"></Icon></span>
						<span>{{yearWeekText}}</span>
					</div>
				</td>
				<td><Select size="small" v-model="conditions.season.value">
        				<Option v-for="item in seasons" :value="item.name">{{item.title}}</Option>
        			</Select></td>
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
	name:'arrangeHeader',
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

		}
	},
	watch:{
		
	},
	methods:{
		clearCondition(c){
			this.conditions[c].current.id = 0
			this.conditions[c].current.name = ''
			this.$emit('on-clear-condition',c)
		},
		prevWeek(){
	    	this.$emit('on-week-change',{action:'prev'})
	    },
	    nextWeek(){
	    	this.$emit('on-week-change',{action:'next'})
	    }
	},
	computed:{
	    yearWeekText(){
	    	return util.sprintf("%s~%s",this.year,this.week)
	    },
	    seasons(){
	    	return this.$store.state.gvars.dicts.season
	    }
	}
}
</script>