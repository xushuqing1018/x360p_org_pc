<template>
	<div :class="wrapClasses">
		<div :class="inputClasses">
			<Tag color="blue" v-if="objName">{{objName}}</Tag>

			<template v-for="(item,index) in tags">
				<Tag v-if="index<3">{{item.name}}</Tag>
				<span v-else>等{{index+1}}人</span>
			</template>			

			<i class="ivu-icon" style="top:0" :class="['ivu-icon-ios-close', prefixCls + '-icon', prefixCls + '-icon-clear' , prefixCls + '-icon-normal']" v-if="clearable" @click="handleClear"></i>
		</div>
		 
		<div :class="[prefixCls + '-group-append']" v-show="slotReady" style="background-color: #eee;">
			<Dropdown class="x-drop-menu">
				<Button type="ghost" icon="arrow-down-b">请选择</Button>		        
		        <DropdownMenu slot="list">
		            <DropdownItem @click.native="chooseCustom">自由选择</DropdownItem>
		            <DropdownItem @click.native="chooseAttendance" v-show="this.model.is_regular==0">从考勤选择</DropdownItem>
		        </DropdownMenu>
		    </Dropdown>
		</div>

		<review-object ref="object" @on-selected="setObject" v-show="false" title="选择作业对象" :is_homework_task="true"></review-object>
		<select-attendance ref="selectAttendance" @on-selected="setAttendanceObject"></select-attendance>
	</div>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import ReviewObject from 'c%/review/review-object.vue'
	import SelectAttendance from 'c%/SelectAttendance.vue'

	const prefixCls = 'ivu-input'

	export default{
		mixins: [ common ],
		components: {
			ReviewObject,
			SelectAttendance
		},
		props: {
			value: {
				type: Object,
				default: ()=>{
					return {
						sid: 0,
						sids: [],
						cid: 0,
						lid: 0,
						is_regular: 0,
						lesson_type: -1
					}
				}
			},
			action: {
				type: String,
				default: 'add'
			},
			size: {
                validator (value) {
                    return oneOf(value, ['small', 'large', 'default']);
                }
            },
            clearable: {
            	type: Boolean,
                default: false
            }
		},
		data () {
			return {
				prefixCls: prefixCls,
				model: this.value,
				tags: [],
				slotReady: false
			}
		},
		watch: {
			tags: function (val) {
				this.$emit('input',this.model)
			},
			value: function (val) {
				this.model = val
				this.initSelected(val)
			}
		},
		created () {
					
		},
		computed: {
			objName () {
				let type = parseInt(this.model.lesson_type)
				let map_type = {0:'班课',1:'一对一',2:'一对多'}
				
				return map_type[type]||''
			},
			wrapClasses () {
                return [
                    `${prefixCls}-wrapper ${prefixCls}-group ${prefixCls}-group-with-append ${prefixCls}-hide-icon`,
                    {
                        [`${prefixCls}-wrapper-${this.size}`]: !!this.size,
                        [`${prefixCls}-type`]: this.type,
                        [`${prefixCls}-group-${this.size}`]: this.append && !!this.size,
                    }
                ];
            },
            inputClasses () {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}-${this.size}`]: !!this.size,
                        [`${prefixCls}-disabled`]: this.disabled
                    }
                ];
            },
		},
		methods: {
			chooseCustom () {
				this.$refs['object'].openModal()
			},
			chooseAttendance () {
				this.$refs['selectAttendance'].show('选择上课记录','add')
			},
			handleClear () {
				this.model.lesson_type = -1
				this.model.cid = 0
				this.model.lid = 0
				this.model.sid = 0
				this.model.sids = []
				this.tags = []

				this.$emit('hideHomeWorkTask')
			},
			setAttendanceObject (row) {
				this.model.ca_id = row.ca_id
				this.model.lesson_type = row.lesson_type
				this.tags = []
				let int_day = row.int_day||moment(new Date()).format('YYYYMMDD')
				
				this.model.deadline = moment(this.$filter('int_date')(row.int_day)).add(7,'days').format('YYYYMMDD')
				
				if(row.lesson_type==0){
					this.model.cid = row.cid
					this.model.eid = row.eid
					this.model.lid = row.lid 
					this.model.sids = []
					
					this.tags.push({
						name: row.cls.class_name,
						id: row.cid
					})
					
				}else{
					this.model.cid = 0
					this.model.lid = row.lid
					this.model.sid = row.lesson_type==1?row.sid_list[0]:0
					this.model.sids = row.lesson_type==1?[]:row.sid_list
					if(row.sid_list.length){
						row.sid_list.forEach((s,i)=>{							
							let obj = {
								name: row.student_name_list[i],
								id: s
							}
							this.tags.push(obj)
						})
					}					
				}

				this.$emit('initHomeWorkTask',row.homework_task_tpl,false)
			},
			setObject (selected) {
				let ids = selected.ids
				this.model.lesson_type = selected.type
				this.model.ca_id = 0
				if(ids.length){
					switch (selected.type){
						case 0: 
							this.model.cid = selected.info.cid
							this.model.eid = selected.map_ids[ids[0]].teach_eid
							this.model.lid = selected.info.lid 
							this.model.sids = []
							this.model.sid = 0
							break;
						case 1:							
						case 2:							
							this.model.cid = 0
							this.model.lid = selected.map_ids[ids[0]].lid
							this.model.sid = selected.type==1?ids[0]:0
							this.model.sids = selected.type==1?[]:ids								
							break;
					}
					this.initSelected(selected)
					this.$emit('initHomeWorkTask',selected.info.homework_task_tpl)
				}
			},
			initSelected (selected) {
				let ids = selected.ids,
					map_ids = selected.map_ids,
					action = this.action
				this.tags = []
				if(action=='edit'){
					if(selected.lesson_type==0){
						this.tags.push({
							name: selected.one_class.class_name,
							id: selected.cid
						})
					}else if(selected.lesson_type==1){
						this.tags.push({
							name: selected.student.student_name,
							id: selected.student.sid
						})
					}else{
						if(selected.students){
							selected.students.forEach(s=>{
								let obj = {
									name: s.student_name,
									id: s.sid
								}
								
								this.tags.push(obj)
							})
						}						
					}				
				}else{
					if(selected.one_class||selected.students) {
						if(selected.lesson_type==0){
							this.tags.push({
								name: selected.one_class.class_name,
								id: selected.cid
							})
						}else if(selected.lesson_type==1){
							this.tags.push({
								name: selected.students[0].student_name,
								id: selected.students[0].sid
							})
						}else{
							if(selected.students){
								selected.students.forEach(s=>{
									let obj = {
										name: s.student.student_name,
										id: s.sid
									}
									this.tags.push(obj)
								})
							}						
						}
					}
					else if(selected.type>0){
						if(ids.length){
							ids.forEach(i=>{						
								let obj = {
									name: map_ids[i].student.student_name,
									id: map_ids[i].student.sid
								}
								
								this.tags.push(obj)
							})
						}
					}else{
						this.tags.push({
							name: selected.info.class_name,
							id: selected.info.cid
						})
					}
				}
			},
		},
		mounted () {
			this.slotReady = true
		}

	}
</script>

<style>
.x-drop-menu .ivu-select-dropdown{
	z-index: 7999;
}
</style>