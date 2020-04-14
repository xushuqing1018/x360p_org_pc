<template>
	<div class="field-content">
		<table class="per__table">
			<thead>
				<tr>
					<th>人员</th>
					<th>角色</th>
					<th>金额</th>
					<th v-if="enable_er_lesson_hour">课时数</th>
					<th width="70">操作</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(item,index) in saleman">
					<td>{{item.eid|ename}}</td>
					<td>{{item.sale_role_did|dict_title('sale_role')}}</td>
					<td>{{item.amount}}</td>
					<td v-if="enable_er_lesson_hour">{{item.lesson_hour}}</td>
					<td>
						<ButtonGroup>
							<Button type="text" icon="edit" size="small" @click="editPer(item,index)"></Button>
							<Button type="text" icon="ios-trash" size="small" @click="deletePer(index)"></Button>
						</ButtonGroup>
					</td>
				</tr>
				<tr v-if="saleman.length==0">
					<td class="text-center" :colspan="enable_er_lesson_hour?5:4">没有业绩归属人</td>
				</tr>
			</tbody>
		</table>
		<div>
			<Button type="text" class="pull-left" size="small" @click="addPer">添加 <Icon type="plus"></Icon></Button>
			<ButtonGroup class="pull-right">
				<Button type="text" size="small" @click="equalize">均分</Button>
				<Button type="text" size="small" @click="fullAmount">全额</Button>
			</ButtonGroup>
		</div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default{
		mixins: [common,globals],
		props: {
			saleman:{
				type: Array,
				default() {
					return []
				}
			},
			lessonAmount: Number,
			lessonHour: Number
		},
		data() {
			return {
				
			}
		},
		computed: {
			default_roles() {
				return this.$store.state.gvars.configs.params.default_sale_role_did
			}
		},
		methods: {
			equalize() {
				let len = this.saleman.length
				if(len) {
					let avgAmount = Math.round(this.lessonAmount/len*100)/100
					let avgHour = Math.round(this.lessonHour/len*100)/100
					for(let i=0;i<len;i++) {
						let data = util.copy(this.saleman[i])
						data.amount = avgAmount
						data.lesson_hour = avgHour
						this.saleman.splice(i,1,data)
					}
				}
			},
			fullAmount() {
				this.saleman.forEach(s => {
					this.$set(s,'amount',this.lessonAmount)
					this.$set(s,'lesson_hour',this.lessonHour)
				})
			},
			editPer(item,index) {
				this.$Modal.open('dashboard/signup/info-performance.vue@modal',{
					props:{
						lessonHour:this.lessonHour,
						lessonAmount:this.lessonAmount
					},
					on:{
						'on-ok':(data) => {
							this.saleman.splice(index,1,data)
						}
					}
				})
				.then(modal => {
					modal
					.set('info',item)
					.show('编辑业绩归属人','edit')
				})
			},
			deletePer(index) {
				this.saleman.splice(index,1)
			},
			addPer() {
				this.$Modal.open('dashboard/signup/info-performance.vue@modal',{
					on:{
						'on-ok':(data) => {
							let hasIndex = this.saleman.findIndex(s =>s.eid == data.eid)
							if(hasIndex > -1) {
								this.$Message.error('请不要重复添加业绩归属人')
								return
							}
							this.saleman.push(data)
						}
					}
				})
				.then(modal => {
					let info = {
						eid: 0,
						sale_role_did: 0,
						amount: this.lessonAmount,
						lesson_hour: this.lessonHour
					}
					if(this.saleman.length) {
						info.sale_role_did = this.saleman[0].sale_role_did
					}
					else {
						info.sale_role_did = this.default_roles.new
					}
					modal
					.set('info',info)
					.show('添加业绩归属人','add')
				})
			}
		}
	}
</script>
<style lang="less">
	.field-per {
		.per__table {
			width: 100%;
			margin-top: 6px;
			th,td {
				border: 1px solid #d7dde4;
				padding: 6px;
			}
			td {
				background-color: #fff;
			}
		}
	}
</style>