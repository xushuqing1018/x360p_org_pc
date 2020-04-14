<template>
	<div class="table-list-wrap">
		<table class="table-list">
			<thead>
				<tr>
					<th><div class="ivu-table-cell">班级名</div></th>
					<th><div class="ivu-table-cell">时段</div></th>
					<th><div class="ivu-table-cell">{{'老师'|translate}}</div></th>
					<th><div class="ivu-table-cell">教室</div></th>
					<th><div class="ivu-table-cell">操作</div></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(item,key) in pageNation(data)">
					<td><div class="ivu-table-cell">{{item.class_name}}</div></td>
					<td><div class="ivu-table-cell">
						<p v-for="ts in item.schedules">
						{{ts.week_day|week_day_text}} {{ts.int_start_hour}}~{{ts.int_end_hour}}
						</p></div>
					</td>
					<td><div class="ivu-table-cell">{{item.teach_eid|employee_name}}</div></td>
					<td><div class="ivu-table-cell">{{item.cr_id|classroom_name}}</div></td>
					<td><div class="ivu-table-cell">
						<Button size="small" 
						:type="info.cid == item.cid?'primary':'ghost'"
						:disabled="isClassDisabled(item)" 
						@click="selectScheduledClass(item)">选择</Button></div>
					</td>
				</tr>
			</tbody>
		</table>
		<div style="margin: 10px;overflow: hidden" v-if="data.length > 0">
	        <div style="float: right;">
	            <Page :total="data.length" :current="page" :page-size="pageSize" @on-change="changePage"></Page>
	        </div>
	    </div>
    </div>
</template>
<script>
import {oneOf} from '@/libs/util'
import util from '@/libs/util'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import dataReady from 'c%/DataReady.vue'
export default {
	name:'scheduleClassesList',
	mixins:[common,globals],
	components:{
		dataReady
	},
	props:{
		info:{
			type:Object,
			default(){
				return {}
			}
		},
		data:{
			type:Object,
			default(){
				return {
					length:0
				}
			}
		},
		pageSize:{
			type:Number,
			default:10
		}
	},
	data(){
		return {
			page:1
		}
	},
	methods:{
		changePage(page){
			this.page = page
		},
		isClassDisabled(item){
			let info = this.info
			let schedules = item.schedules.filter(s=>{
				return (s.week_day == info.week_day &&
				s.int_start_hour == info.int_start_hour && 
				s.int_end_hour   == info.int_end_hour)
			})
			if(schedules && schedules.length > 0){
				return true
			}
			return false
		},
		selectScheduledClass(item){
			if(this.info.cid == 0){
				this.info.cid = item.cid
			}else{
				this.info.cid = 0
			}
		},
		pageNation(classes){
			let startIndex = (this.page - 1) * this.pageSize
			let endIndex   = startIndex + this.pageSize
			let list = []
			let i = 0
			for(let c in classes){
				if(c == 'length'){
					continue
				}
				if(i >= startIndex && i < endIndex){
					list.push(classes[c])
				}
				i++
			}
			return list
		},
	}
}
</script>