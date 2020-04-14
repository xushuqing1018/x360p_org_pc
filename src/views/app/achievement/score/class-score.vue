<template>
	<Modal v-drag-modal :mask-closable="false" width="750" v-model="modal$.show" :title="modal$.title">
		<Row>
			<Col span="12">
				<label>班级名称：</label>
				<Select v-model="cid" size="small" style="width:60%" @on-change="init_data">
					<Option :value="-1"><不限></Option>
					<Option v-for="item in classList" :value="item.value">{{item.name}}</Option>
				</Select>
			</Col>
		</Row>
		<div class="list-body mt-3">
			<div class="list-body-wrap" v-loading.like="'query_class'">
				<table class="modal-table">
					<thead>
						<tr>
							<th><div class="ivu-table-cell">班级名称</div></th>
							<th><div class="ivu-table-cell">考试人数</div></th>
							<th><div class="ivu-table-cell">最高分</div></th>
							<th><div class="ivu-table-cell">最低分</div></th>
							<th><div class="ivu-table-cell">平均分</div></th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in data">
							<td><div class="ivu-table-cell">
								<span class="text-info cursor" @click="checkStudent(item)">{{item.one_class?item.one_class.class_name:'[未知]'}}</span>
							</div></td>
							<td><div class="ivu-table-cell">{{item.student_num}}</div></td>
							<td><div class="ivu-table-cell">{{item.max_score}}</div></td>
							<td><div class="ivu-table-cell">{{item.min_score}}</div></td>
							<td><div class="ivu-table-cell">{{(item.avg_score).toFixed(2)}}</div></td>
						</tr>
						<tr class="text-center" v-if="data.length==0">
							<td colspan="5"><div class="ivu-table-cell">没有数据</div></td>
						</tr>
					</tbody>
					<tfoot>
						<tr class="text-right">
							<td colspan="5">
								<Page 
				                	:total="total" 
				                	:current="pageIndex" 
				                	:show-sizer="true" 
				                	:page-size="pageSize" 
				                	:show-total="true" 
				                	@on-change="pagenation" 
				                	@on-page-size-change="pagesize">
				                </Page>
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
    	<div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
        </div>
        <class-student-score ref="class_detail" @on-success="refreshData"></class-student-score>
    </Modal>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import ClassStudentScore from './class-student-score.vue'
	
	export default{
		mixins:[grid,modal,common],
		components: {
			ClassStudentScore
		},
		data () {
			return {
				info: {},
				cid: -1,
				classList: [],
				rest_api: 'student_exam_scores/query_class'
			}
		},
		watch: {
			'modal$.show': function(val) {
            	if(val) {
            		this.init_data()
        		}		            
	        }
        },
        methods: {
        	checkStudent(item) {
        		this.$r('class_detail')
        		.set('cid',item.cid)
        		.set('info',this.info)
        		.set('classList',this.classList)
        		.show(util.sprintf('学员成绩查询【%s】',this.info.exam_name))
        	},
        	hook_get_param(param) {
        		param.se_id = this.info.se_id
        		if(this.cid>-1) {
        			param.cid = this.cid
        		}
        	},
        	deal_data(data) {
        		if(this.cid == -1) {
        			this.classList.splice(0)
        			data.list.forEach(item=>{
						this.classList.push({
							value:item.cid,
							name:item.one_class?item.one_class.class_name:'[未知]'
						})
					})
        		}
        		return data.list
        	},
        	refreshData() {
        		this.$emit('on-success')
        		this.init_data()
        	}
        }
	}
</script>
