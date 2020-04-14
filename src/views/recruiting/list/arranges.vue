<template>
	<div class="list-main">
		<div class="list-condition">
	    	<Row>
	    		<Col span="8">
	    			<date-range-picker v-model="params.int_day" @on-change="search" label="选择日期" placement="bottom"></date-range-picker>
	    		</Col>
	    		<Col span="10">
	    			<ButtonGroup>
	    				<Button type="primary" icon="ios-search" @click="search" size="small">查询</Button>
	    			</ButtonGroup>
	                <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>
	    		</Col>
	    	</Row>
	    </div>
		<div class="list-body">
			<data-ready :data="['course_arranges?order_field=int_day&order_sort=asc&is_attendance=0&with=one_class&cid='+cid]" @ready="dataReady">
				<div class="list-body-wrap" v-loading.like="'course_arrange'">			
		            <table class="table-list">
		                <thead>
		                    <tr>                                 
		                        <th><div class="ivu-table-cell">班级名称</div></th>
		                        <th><div class="ivu-table-cell">上课时间</div></th>
		                        <th><div class="ivu-table-cell">上课时段</div></th>
		                        <th><div class="ivu-table-cell">{{'老师'|translate}}</div></th>
		                        <th><div class="ivu-table-cell">{{'学管师'|translate}}</div></th>
		                        <th><div class="ivu-table-cell">教室</div></th>
		                    </tr>
		                </thead>
		                <tbody>
		                    <tr :class="{'table-info':item.ca_id == current_ca_id}" @click="toggleSelected(item)" v-for="item in data">                                   
		                        <td><div class="ivu-table-cell">{{item.one_class.class_name}}</div></td>
		                        <td><div class="ivu-table-cell">{{item.int_day|int_date}}</div></td>
		                        <td><div class="ivu-table-cell">{{item.int_start_hour|int_hour}} - {{item.int_end_hour|int_hour}}</div></td>
		                        <td><div class="ivu-table-cell">{{item.teach_eid|employee_name}}</div></td>
		                        <td><div class="ivu-table-cell">{{item.edu_eid|employee_name}}</div></td>
		                        <td><div class="ivu-table-cell">{{item.cr_id|classroom_name}}</div></td>
		                    </tr>
		                    <tr v-if="data.length == 0">
		                        <td colspan="5" style="text-align: center"><p class="empty">没有找到排课记录</p></td>
		                    </tr>
		                </tbody>
		            </table>
		        </div>
		
		        <div class="list-page clearfix">
		            <Page class="pull-right" size="small" :total="total" :show-total="true" :current="pageIndex" :show-sizer="true" :page-size="pageSize" @on-change="pagenation" @on-page-size-change="pagesize"></Page>
		        </div>
	        </data-ready>
		</div>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import dataReady from 'c%/DataReady.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			dataReady,
			dateRangePicker
		},
		props: {
			cid: {
				type: [Number,String],
				default: 0
			}
		},
		data () {
			return {
				rest_api: 'course_arranges',	
				is_data_init: false,
				current_ca_id: 0,
				params: {
					int_day: []
				}
			}
		},
		mounted () {
			
		},
		methods: {
			dataReady (rs) {
				this.data = rs[0].list
				this.total = rs[0].total
				this.pageIndex = rs[0].page
			},
			hook_get_param (params) {
				params.with = 'one_class'
				params.is_attendance = 0
				params.cid = this.cid
				params.int_day = util.get_date_query(this.params.int_day)
				params.order_field = 'int_day'
				params.order_sort = 'asc'
			},
			toggleSelected(item) {	
                if(item.current_ca_id == item.ca_id){
                	this.current_ca_id = 0
                }else{
                    this.current_ca_id = item.ca_id
                    this.$emit('on-select',item)
                }	            
			}	
		}
	}
</script>
