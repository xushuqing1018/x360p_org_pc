<template>
	<Modal 
		v-drag-modal 
		:mask-closable="false" 
		v-model="modal$.show" 
		:title="modal$.title" 
		width="500" 
		class="version-modal">
		<div class="version-list">
			<table>
				<tbody>
					<template v-for="item in data">
						<tr class="title" @click="item.expand$=!item.expand$">
							<td>
								<p>{{is_orgs?'系统':'校360'}}&nbsp;{{item.ver}}主要更新</p>
								<span>{{get_date(item)}}</span>
							</td>
							<td>
								<Icon type="chevron-right" v-if="!item.expand$"></Icon>
								<Icon type="chevron-down" v-else></Icon>
							</td>
						</tr>
						<tr v-if="item.expand$">
							<td colspan="2">
								<div class="html" v-html="item.content"></div>
							</td>
						</tr>
					</template>
					<tr class="text-center" v-if="!data.length"><td colspan="2">没有数据</td></tr>
				</tbody>
			</table>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'

	export default {
		mixins: [modal,common],
		data() {
			return {
				data:[]
			}
		},
		methods:{
			init_data() {
				this.$rest('center_versions')
				.get()
				.success(res => {
					res.forEach(i => {
						i.expand$ = false
					})
					this.data = res
				})
				.error(res => {
					this.$Message.erro(res.body.message)
				})
				return this
			},
			get_date(item) {
				let month,day
				month = item.publish_date.toString().substring(4,6)
				day = item.publish_date.toString().substring(6,8)
				return util.sprintf('%s月%s日',month,day)
			}
		}
	}
</script>
<style lang="less">
	.version-modal {
		.version-list {
			min-height: 100px;
			max-height: 650px;
			overflow-y: auto;
			table {
				width: 100%;
				padding: 15px;
				tr:first-child {
					border-top: 0 !important;
				}
				.title {
					border-top: 1px solid #e9eaec;
					td {
						padding-top: 5px;
						padding-bottom: 5px;
						&:nth-child(2) {
							width: 40px;
							text-align: center;
							cursor: pointer;
						}
					}
					p { font-size: 13px; }
					span { padding-top: 3px;color: #aaa; }
				}
				.html { padding: 2px 10px; background: #f2f2f2; }
			}
		}
		.ivu-modal-body { padding-top: 5px; }
		.ivu-modal-footer { display: none; }
	}
</style>