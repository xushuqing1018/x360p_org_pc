<style lang="less">
	.maintenance-modal-content {
		min-height: 100px;
		max-height: 300px;
		overflow-y: auto;
		padding: 10px 25px;
		.reset-data {
			.captcha-container {
				margin-top: 15px;
				.btn-captcha {
					margin-left: 10px;
				}
			}
			.select-container,.branch-del {
				margin-top: 15px;
			}
		}
		.msg {
			>p {
				line-height: 2.2;
			}
		}
	}
</style>
<template>
	<div class="c-grid">
		<table class="table-list">
			<thead>
				<tr>
					<th><div class="ivu-table-cell">操作说明</div></th>
					<th width="180"><div class="ivu-table-cell">操作</div></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(item,index) in data" v-if="item.show">
					<td>
						<div class="ivu-table-cell">
							<p style="font-size:14px">{{item.action}}</p>
							<p style="color:#999">{{item.desc}}</p>
						</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<Button type="primary" @click="ok(item,index)">确定</Button>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
<script>

	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [modal,common],
		data() {
			return {
				data: [
					{
						action: '数据缓存字段更新',
						desc: '包括学员剩余课时，订单金额等数据的统计字段更新',
						url: 'redundant_fields',
						content: '<p>开始更新...</p>',
						status: 0,
						show: true
					},
					{
						action: '系统恢复出厂设置',
						desc: '清空所有数据，恢复到初始状态',
						url: 'system/reset?force=0',
						content: '<p>开始重置...</p>',
						status: 0,
						show: true
					},
					{
						action: '批量删除市场名单',
						desc: '请谨慎操作',
						url: 'market_clues',
						show: true
					},
					{
						action: '批量删除客户名单',
						desc: '请谨慎操作',
						url: 'customers',
						show: true
					},
					{
						action: '批量删除导入课时',
						desc: '请谨慎操作',
						url: 'student_lesson_import_logs',
						show: true
					},
					{
					    action: '校正剩余课时金额',
						desc: '校正剩余课时金额',
						url : 'system/correct_remain_lesson_amount',
                        content: '<p>开始校正...</p>',
						show: true
					},
				]
			}
		},
		mounted() {
			let indexs = [1,2,3]
			this.data.forEach((index,item) => {
				if(indexs.indexOf(index) > -1) {
					item.show = this.is_admin
				}
			})
		},
		computed: {
			user() {
				return this.$store.state.user
			},
			is_admin() {
		      	return this.user.info.is_admin === 1
			},
			mobile_admin() {
				return this.user.info.mobile || ''
			},
			has_add_help_permit() {
				return this.user.info.allow_add_help == 1
			}
		},
		methods: {
			ok (item,index) {
				if(index === 0) {
					this.update(item)
				}else if(index === 1){
					this.resetData(item)
				}else if(index == 2 || index == 3){
					this.delete_batch(item)
				}else if(index == 4) {
					this.deleteImportLesson(item)
				}else if(index == 5){
				    this.correct(item)
				}
			},
			deleteImportLesson(item) {
				this.$Modal.open('system/configs/maintenance/delete-import-lesson.vue@modal',{
					props: {
						info: item
					}
				})
				.then(modal => {
					modal.show(item.action,'info')
				})
			},
			delete_batch(item) {
				this.$Modal.open('system/configs/maintenance/delete-modal.vue',{
					props: {
						info: item
					}
				})
				.then(modal => {
					modal.show(item.action,'info')
				})
			},
			update(item) {
				this.$Modal.open('system/configs/maintenance/update-modal.vue',{
					props: {
						data: item
					}
				})
				.then(modal => {
					modal.show(item.action,'info')
				})
			},
            correct(item) {
                this.$Modal.open('system/configs/maintenance/correct-modal.vue',{
                    props: {
                        data: item
                    }
                })
					.then(modal => {
                        modal.show(item.action,'info')
                    })
            },
			resetData(item) {
				if(this.is_admin) {
					if(this.mobile_admin) {
						this.$Modal.open('system/configs/maintenance/reset-modal.vue',{
							props: {
								data: item
							}
						})
						.then(modal => {
							modal.show('短信验证','info')
						})
					}else{
						this.$Message.error('您还没有绑定手机号')
						return false
					}
				}else{
					this.$Message.error('您不是超级管理员，无法进行此操作')
					return false
				}
			}
		}
	}
</script>