<template>
	<Modal v-drag-modal :mask-closable="false" width="880" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<table class="table">
			<thead>
				<tr>
					<th>学号</th>
					<th>姓名</th>
					<th>性别</th>
					<th>出生日期</th>
					<th>手机号码</th>
					<th>公立学校</th>
					<th>年级</th>
					<th>报名校区</th>
				</tr>
			</thead>
			<tbody>
				<tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="item in items">
					<td>{{item.sno||'——'}}</td>
					<td>
						<Tag color="blue" type="border" style="margin-left:5px;" v-if="item.cu_id&&item.ui_id!==0">意向客户</Tag>
						<Tag color="green" type="border" style="margin-left:5px;" v-else>正式学员</Tag>
						{{item.student_name||item.name}}
					</td>
					<td>{{item.sex|sex}}</td>
					<td>{{item.birth_time||'——'}}</td>
					<td>{{item.first_tel}}</td>
					<td>{{item.school_id_text||'——'}}</td>
					<td>{{formatGrade(item.school_grade)}}</td>
					<td>{{formatBranch(item.bid)}}</td>
				</tr>
			</tbody>
		</table>
		<div slot="footer">
            <Button type="ghost" @click="sameOne">和所选学员是同一人</Button>                                
            <Button type="primary" @click="isNew">是新学员，继续录入</Button>                
        </div>
        <to-formal-modal ref="toFormalModal" :item="selItem"></to-formal-modal>
	</Modal>
</template>
<script>
	import modalMixin from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import grid from '@/libs/grid.mixin'
	import {_} from '@/libs/util'
	import util from '@/libs/util'
	import moment from 'moment'
	import common from '@/libs/common.mixin'
	import ToFormalModal from './to-formal-modal.vue'

	const idField = 'lid' 

	export default {
		name: 'search',
		mixins: [modalMixin,globals,grid,common],
		components: {
			ToFormalModal
		},
		props: {
			items: {
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
                 	this.items.forEach(item=>{
                        item.$selected = false
                    })
                    item.$selected = true
                    this.selItem = item
                }
			},
			sameOne() {
				let sel = this.selItem
				if(_.isEmpty(sel)) {
					this.$Message.error('请选择一名学员')
				}else{
					if(sel.cu_id&&sel.cu_id!==0) {
						this.$r('toFormalModal').show('转为正式学员','toFormal')
					}else{
						this.$router.push({
							name: 'dashboard_payment',
							params:{ sid: sel.sid }
						})
					}
				}
			},
			isNew() {
				this.modal$.show = false
			}
		},
		computed: {

		}
	}
</script>
<style lang="less" scoped>
	
</style>