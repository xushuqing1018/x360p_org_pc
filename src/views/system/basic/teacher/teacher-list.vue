<template>
	<div class="box">
		<div class="teacher-list">
			<div class="condition-filter">
            	<Input size="small" v-model="teacher_key" icon="search" :placeholder="label_filter_teacher"></Input>
            </div>
            <div class="condition-list clearfix">
            	<div class="item" v-for="item in filterTeachers">
		            <a :class="{'selected':current_id == item.eid}" @click="selTeacher(item)">
		            {{item.ename}}

		            <Icon class="arrow-right" type="ios-arrow-right" v-show="current_id == item.eid"></Icon>
		            </a>
		        </div>
            	<p class="empty" v-if="filterTeachers.length == 0">没有搜索到匹配的{{'老师'|translate}}</p>
            </div>
		</div>
	</div>
</template>
<script>
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin' 
	export default {
		mixins: [grid,common],
		data() {
			return {
				rest_api: 'employees?rids=1',
				teacher_key: '',
				current_id: 0
			}
		},
		methods: {
			selTeacher(item) {
				this.current_id = item.eid
			}
		},
		mounted() {
			if(this.filterTeachers.length > 0) {
				this.current_id = this.teachers[0].eid
			}
		},
		computed: {
			filterTeachers(){
				let key = this.teacher_key
				if(!/^\s*$/.test(key)){
					return this.teachers.filter(item => item.ename.indexOf(key) !== -1)
				}
				return this.teachers
			},
			teachers() {
				let lists = this.$store.state.gvars.employees||[]
				let bid   = this.bid$
				let rid   = 1		//老师角色是1
				return lists.filter(
					item => item.rids.indexOf(rid) !== -1 && item.bids.indexOf(bid) !== -1
					)
			}
		},
		watch: {
			'current_id': {
				handler:function(id) {
					this.$emit('on-select',id)
				}
			},
			'bid$': {
				handler:function(bid) {
					if(this.filterTeachers.length > 0) {
						this.current_id = this.filterTeachers[0].eid
					} 
				}
			},
			'$store.state.gvars.employees.length': function(employees) {
				if(this.teachers.length > 0) {
					this.current_id = this.teachers[0].eid
				}
			}
		}
	}
</script>
<style lang="less">
	.teacher-list {
		min-height: 650px;
		.arrow-right {
			float: right;
			line-height: 2.2;
		}
	}
</style>