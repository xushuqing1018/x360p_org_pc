<template>
	<Card dis-hover>
		<template v-if="!isEmptyObj">
			<div class="teacher-tabs">
				<Tabs v-model="current_tab">
					<TabPane label="科目" name="subject">
						<CheckboxGroup v-model="info.sj_ids">
							<Checkbox 
								:label="item.sj_id" 
								v-for="item in subjects"
								style="padding:10px 10px 5px">
								{{item.subject_name}}
							</Checkbox>
						</CheckboxGroup>
						<Checkbox v-model="sel_all_sj" class="check-all" @on-change="selAllSj">全选</Checkbox>
						<Button type="primary" size="small" class="pull-right" @click="submit">提交</Button>
					</TabPane>
					<TabPane label="课程" name="lesson">
						<CheckboxGroup v-model="info.lids">
							<Checkbox 
								:label="item.lid" 
								v-for="item in lessons"
								style="padding:10px 10px 5px">
								{{item.lesson_name}}
							</Checkbox>
						</CheckboxGroup>
						<Checkbox v-model="sel_all_l" class="check-all" @on-change="selAllLesson">全选</Checkbox>
						<Button type="primary" size="small" class="pull-right" @click="submit">提交</Button>
					</TabPane>
					<TabPane label="校区" name="branch">
						<CheckboxGroup v-model="info.bids">
							<Checkbox 
								:label="item.bid" 
								v-for="item in branchs"
								style="padding:10px 10px 5px">
								{{item.branch_name}}
							</Checkbox>
						</CheckboxGroup>
						<Checkbox v-model="sel_all_b" class="check-all" @on-change="selAllBranch">全选</Checkbox>
						<Button type="primary" size="small" class="pull-right" @click="submit">提交</Button>
					</TabPane>
					<TabPane label="班级" name="class">
						<classes :eid="info.eid"></classes>
					</TabPane>
					<TabPane label="排课" name="arrange">
						<arrange :eid="info.eid"></arrange>
					</TabPane>
				</Tabs>
			</div>
		</template>
		<template v-else>
			<p class="text-center p-4">没有数据</p>
		</template>
	</Card>
</template>
<script>
	import util 		from '@/libs/util'
	import {_}			from '@/libs/util'
	import globals		from '@/libs/globals.mixin'
	import Classes 		from './record/classes.vue'
	import Arrange 		from './record/arrange.vue'
	
	import moment from 'moment'

	export default {
		mixins: [globals],
		components: {
			Classes,
			Arrange
			
		},
		props: {
			eid: {type: Number}
		},
		data() {
			return {
				current_tab: 'subject',
				sel_all_sj: false,
				sel_all_b: false,
				sel_all_l: false,
				info: {},
				classes: []
			}
		},
		methods: {
			selAllBranch(value) {
				if(value) {
					this.branchs.forEach(item => {
						if(this.info.bids.indexOf(item.bid) == -1) {
							this.info.bids.push(item.bid)
						}
					})
				}else{
					this.info.bids.splice(0,this.info.bids.length)
				}
			},
			selAllSj(value) {
				if(value) {
					this.subjects.forEach(item => {
						if(this.info.sj_ids.indexOf(item.sj_id) == -1) {
							this.info.sj_ids.push(item.sj_id)
						}
					})
				}else{
					this.info.sj_ids.splice(0,this.info.sj_ids.length)
				}
			},
			selAllLesson(value) {
				if(value) {
					this.lessons.forEach(item => {
						if(this.info.lids.indexOf(item.lid) == -1) {
							this.info.lids.push(item.lid)
						}
					})
				}else{
					this.info.lids.splice(0,this.info.lids.length)
				}
			},
			submit() {
				let params = {
					sj_ids: this.info.sj_ids,
					bids: this.info.bids,
					lids: this.info.lids
				}
				this.$rest('employees')
				.add_url_param(this.info.eid)
				.put({employee: params})
				.success(response => {
					this.$Message.success('提交成功')
					this.$store.dispatch('updateGlobalVar','employees')
				})
				.error(response => {
					this.error(response.body.message)
				})
			},
			getEmployee(eid) {
				return this.$store.state.gvars.employees.find(item=>item.eid == eid)
			}
		},
		computed: {
			isEmptyObj() {
				return _.isEmpty(this.info)
			},
			subjects() {
				return this.$store.state.gvars.subjects
			},
			branchs() {
				return this.$store.state.gvars.branchs
			},
			lessons() {
				return this.$store.state.gvars.lessons
			}
		},
		watch: {
			eid(id) {
				this.info = util.copy(this.getEmployee(id))
				if(this.info.sj_ids.length == this.subjects.length) {
					this.sel_all_sj = true
				}else{
					this.sel_all_sj =false
				}
				if(this.info.bids.length == this.branchs.length) {
					this.sel_all_b = true
				}else{
					this.sel_all_b =false
				}
				if(this.info.lids.length == this.lessons.length) {
					this.sel_all_l = true
				}else{
					this.sel_all_l =false
				}
			},
			'info.bids': {
				handler: function(bids) {
					if(bids.length == this.branchs.length) {
						this.sel_all_b = true
					}else{
						this.sel_all_b = false
					}
				}
			},
			'info.sj_ids': {
				handler: function(sj_ids) {
					if(sj_ids.length == this.subjects.length) {
						this.sel_all_sj = true
					}else{
						this.sel_all_sj = false
					}
				}
			},
			'info.lids': {
				handler: function(lids) {
					if(lids.length == this.lessons.length) {
						this.sel_all_l = true
					}else{
						this.sel_all_l = false
					}
				}
			}
		}
	}
</script>
<style lang="less">
	.teacher-tabs {
		min-height: 300px;
	 	.check-all {
	 		padding: 10px 10px 5px;
	 	}
	}
</style>