<template>
	<Modal v-drag-modal :mask-closable="false" width="880" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<Alert>检测到您手机号下绑定有多个学员，是否将其手机号一并修改</Alert>
		<table class="table-list">
			<thead>
				<tr>
					<th><div class="ivu-table-cell">学号</div></th>
					<th><div class="ivu-table-cell">姓名</div></th>
					<th><div class="ivu-table-cell">性别</div></th>
					<th><div class="ivu-table-cell">出生日期</div></th>
					<th><div class="ivu-table-cell">手机号码</div></th>
					<th><div class="ivu-table-cell">公立学校</div></th>
					<th><div class="ivu-table-cell">年级</div></th>
					<th><div class="ivu-table-cell">报名校区</div></th>
				</tr>
			</thead>
			<tbody>
				<tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="item in data">
					<td><div class="ivu-table-cell">{{item.sno||'——'}}</div></td>
					<td><div class="ivu-table-cell">
						<Tag color="blue" type="border" style="margin-left:5px;" v-if="item.cu_id&&item.ui_id!==0">意向客户</Tag>
						<Tag color="green" type="border" style="margin-left:5px;" v-else>正式学员</Tag>
						{{item.student_name||item.name}}</div>
					</td>
					<td><div class="ivu-table-cell">{{item.sex|sex}}</div></td>
					<td><div class="ivu-table-cell">{{item.birth_time||'——'}}</div></td>
					<td><div class="ivu-table-cell">{{item.first_tel}}</div></td>
					<td><div class="ivu-table-cell">{{item.school_id_text||'——'}}</div></td>
					<td><div class="ivu-table-cell">{{formatGrade(item.school_grade)}}</div></td>
					<td><div class="ivu-table-cell">{{formatBranch(item.bid)}}</div></td>
				</tr>
			</tbody>
		</table>
		<div slot="footer">
            <Button type="ghost" @click="sameOne">只修改当前这个</Button>                                
            <Button type="primary" @click="isNew">一并修改</Button>                
       </div>
	</Modal>
</template>
<script>
	import modalMixin from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import {_} from '@/libs/util'
	import util from '@/libs/util'
	import moment from 'moment'
	import common from '@/libs/common.mixin'

	const idField = 'lid' 

	export default {
		name: 'search',
		mixins: [modalMixin,globals,common],		
		props: {
			data: {
				type: Array,
				default(){
					return []
				}
			}
		},
		data() {
			return {
				selItem: {}
			}
		},
		mounted() {

		},
		methods: {
			formatGrade(grade) {
				return this.labelDicts(grade,'grade') || '——'
			},
			formatBranch(bid) {
				return this.labelBranch(bid) || '——'
			},
			toggleSelected(item) {
				if(!item.$selected){
                 	this.data.forEach(item=>{
                        item.$selected = false
                    })
                    item.$selected = true
                    this.selItem = item
                }
			},
			sameOne() {
//				let sel = this.selItem
//				if(_.isEmpty(sel)) {
//					this.$Message.error('请选择一名学员')
//				}else{
//					if(sel.cu_id&&sel.cu_id!==0) {
//						this.$r('toFormalModal').show('转为正式学员','toFormal')
//					}else{
//						this.$router.push({ name: 'dashboard_payment', params: { sid: sel.sid }})
//					}
//				}
				this.$emit('on-change','')
			},
			isNew() {
				this.close()
				this.$emit('on-change','all')
			}
		},
		computed: {

		}
	}
</script>
<style lang="less" scoped>
	
</style>