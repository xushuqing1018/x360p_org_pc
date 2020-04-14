<template>
	<Modal v-drag-modal :mask-closable="false" width="1000" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		
		<div class="toolbar" style="margin-bottom:10px;">
			<Dropdown>
        		<Button type="primary" icon="plus">排课</Button>
        		<DropdownMenu slot="list">
        			<DropdownItem @click.native="add"><Icon type="drag"></Icon> 简单循环排课</DropdownItem>
        			<DropdownItem @click.native="multiAdd"><Icon type="ios-infinite"></Icon> 规律循环排课</DropdownItem>
        			<DropdownItem @click.native="editClassSchedule"><Icon type="calendar"></Icon> 按计划排课</DropdownItem>
        		</DropdownMenu>
        	</Dropdown>			
			<Button type="primary" icon="refresh" @click="refreshModalList"></Button>
			<Tooltip placement="bottom">				
				<div slot="content">
					根据班级课次数和班级上课时间段规律自动排课
				</div>
			</Tooltip>
		</div>
		
    	<class-arranges-list
    		@save="refreshArrange"
	    	:class-info="classInfo"
	    	ref="arrangesList"
	    	>
    	</class-arranges-list>
		
		<arrange-set-modal
			@save="updateClassInfo"
			@on-success="refreshArrange"
			ref="arrange_set"
			>
		</arrange-set-modal>

		<div slot="footer">
    		<Button type="ghost" @click="close">关闭</Button>
    	</div>

	</Modal>
</template>
<script>
	import Vue from 'vue'
	import moment from 'moment'
	import util from '@/libs/util'
	import globals from '@/libs/globals.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import classArrangesList from './arranges-list.vue'
	import ArrangeSetModal from './arrange-set-modal.vue'
	
	export default{
		name:'classArrangesModal',
		mixins:[common,globals,modal],
		components: {
			classArrangesList,
			ArrangeSetModal
		},
		props:{
			
		},
		data () {
			return {
				classInfo:{
					cid:0
				}
			}
		},

		methods: {	
			multiAdd () {
				this.$Modal.open('business/class/arrange/multi-add-modal.vue',{
					on: {
						'on-success': ()=>{
							this.refreshArrange()
						}
					},
					props: {
						cls: this.classInfo
					}
				})
				.then(modal=>{
					modal.show('规律排课','add')
				})
			},
			refreshModalList() {
				this.$refs.arrangesList.refreshData()
			},
			refreshArrange () {
				this.$emit('on-success')
				this.$refs.arrangesList.refreshData()
			},
			add(){
				this.$r('arrangesList').add()
			},
			editClassSchedule(){
                this.$r('arrange_set')
                .set('info',this.classInfo)
                .show(util.sprintf('编辑班级的排课计划【%s】',this.classInfo.class_name),'edit')
			},
			
			classSchedule(){
				this.$refs['classScheduleModal'].show()
			},
			updateClassInfo({action,data}){
				if(action == 'edit'){
					let fields = ['lesson_start_time','lesson_end_time','lesson_times','schedules']
					fields.forEach(f=>{
						if(data[f] != this.classInfo[f]){
							this.classInfo[f] = data[f]
						}
					})
				}
				this.$emit('on-success')
			}
		}
	}
</script>
