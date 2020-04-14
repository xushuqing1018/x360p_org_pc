<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800" @cancel="cancel">
		<div :class="classes">
			<div class="list-tab">
				<Row>
					<Col span="24">
						<RadioGroup v-model="type" type="button" size="small" class="mr-3">
					        <Radio :disabled="allowType.length == 1" :label="1" v-if="allowType.indexOf(1) !== -1">1对1</Radio>
					        <Radio :disabled="allowType.length == 1" :label="2" v-if="allowType.indexOf(2) !== -1">1对多</Radio>
					        <Radio :disabled="allowType.length == 1" :label="0" v-if="allowType.indexOf(0) !== -1">班级</Radio>
					  	</RadioGroup>
					  	<Button type="ghost" icon="refresh" @click="refresh(type)" size="small">刷新</Button>
            		</Col>            		
            	</Row>
            	
		    </div>
	    	<div class="list-condition mt-3">
	    		<div class="row">
	    			<div class="col-sm-4 mb-2" :class="type===2?'col-sm-6':''">
	    				<Input v-model="data[1].key" placeholder="请输入学员姓名" size="small" v-if="type===1" icon="ios-search"></Input>
		    			<Input v-model="data[2].key" placeholder="请输入学员姓名" size="small" v-if="type===2" icon="ios-search"></Input>
		    			<Input v-model="data[0].key" placeholder="请输入班级名称" size="small" v-if="type===0" icon="ios-search"></Input>
	    			</div>
	    			<div class="col-sm-4 mb-2" :class="type===2?'col-sm-6':''" v-if="condition.indexOf('lid')==-1">
	    				<select-lesson v-model="data.lid" clearable size="small" placeholder="请选择课程"></select-lesson>		
	    			</div>
	    			<div class="col-sm-4" :class="type===2?'col-sm-6':''">
	    				<Select v-model="data.sj_id" size="small">
	    					<Option :value="0">全部(科目)</Option>
	    					<Option :value="item.sj_id" v-for="item in filter_subjects">{{item.subject_name}}</Option>
	    				</Select>
	    			</div>
	    		</div>
	    	</div>
		    <div class="list-body">
		    	<div class="list-body-wrap" v-loading.like="'student_lessons'" v-if="type!=0">
			    	<table class="modal-table table-list">
			    		<thead>
                            <tr>
                                <th width="50" v-if="type===2">
                                	<div class="ivu-table-cell">
                                		<Checkbox v-model="checkAll" @click.native="handleCheckAll"></Checkbox>
                                	</div>
                                </th>
                                <th><div class="ivu-table-cell">姓名</div></th>
                                <th><div class="ivu-table-cell">性别</div></th>
                                <th><div class="ivu-table-cell">课程</div></th>
                                <th><div class="ivu-table-cell">科目</div></th>
                                <th><div class="ivu-table-cell">课时进度</div></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="item in filterList(type)" v-if="item.student">
                                <td v-if="type===2">
                                    <div class="ivu-table-cell"><Checkbox :value="item.$selected" @click="toggleSelected(item)" :readonly="true"></Checkbox></div>
                                </td>
                                <td><div class="ivu-table-cell">{{item.student.student_name}}</div></td>
                                <td><div class="ivu-table-cell">{{formatSex(item.student.sex)}}</div></td>
                                <td><div class="ivu-table-cell">{{item.lid|lesson_name}}</div></td>
                                <td><div class="ivu-table-cell">{{getSubjectName(item)}}</div></td>
                                <td>
                                	<div class="ivu-table-cell">
	                                	<Progress :percent="studentLessonArrangePercent(item)" :stroke-width="5">
	                                		{{item.lesson_hours-item.remain_arrange_hours}}/{{item.lesson_hours}}
	                                	</Progress>
                                	</div>
                                </td>
                            </tr>
                            <tr v-if="data[type].length == 0">
                                <td colspan="5" style="text-align: center"><p class="empty">没有找到学员</p></td>
                            </tr>
                        </tbody>                        
			    	</table>
		    	</div>
		    	<div class="list-body-wrap" v-else>
		    		<table class="table table-list">
		    			<thead>
                            <tr>
                                <th><div class="ivu-table-cell">班级</div></th>
                                <th><div class="ivu-table-cell">学员数</div></th>      
                                <th><div class="ivu-table-cell">课程</div></th>
                                <th><div class="ivu-table-cell">课时进度</div></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="item in filterList(type)">
                                <td><div class="ivu-table-cell">{{item.class_name}}</div></td>
                                <td><div class="ivu-table-cell">{{item.student_nums}}</div></td>
                                <td><div class="ivu-table-cell">{{item.lid|lesson_name}}</div></td>
                                <td>
                                	<div class="ivu-table-cell">
	                                	<Progress :percent="classArrangePercent(item)" :stroke-width="5">
	                                		{{item.attendance_times}}/{{item.lesson_times}}
	                                	</Progress>
                                	</div>
                                </td>
                            </tr>
                            <tr v-if="data[type].length == 0">
                                <td colspan="3" style="text-align: center"><p class="empty">没有找到班级</p></td>
                            </tr>
                        </tbody>
		    		</table>
		    	</div>
		    </div>
	    	<div class="multi-selected" v-if="type===2">
                <Card>
                    <div slot="title">
                        <span>已选择：<span class="badge">{{selectedTotal}}</span></span>
                        <Button @click="clearSelectedId" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="清空"></Button>
                    </div>
                    <ul class="multi-selected-list">
                        <li v-for="item in selected.ids">
                            <span>{{selected.map_ids[item].student.student_name}}</span>
                            <Button @click="addSelectedIds(item)" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="移除"></Button>
                        </li>
                    </ul>
                </Card>
            </div>
		</div>
		<div slot="footer">
			<div class="pull-left" v-if="type!==2&&selected.ids.length>0">
				已选择：<span class="text-info">
					<label v-if="type===0">{{selected.map_ids[selected.ids[0]].class_name}}</label>
					<label v-else>{{selected.map_ids[selected.ids[0]].student.student_name}}</label>
				</span>
			</div>
			<Button type="ghost" @click="cancel">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
 		</div>
	</Modal>
</template>

<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import selectLesson from 'c%/SelectLesson.vue'
	const prefixCls = 'select-list';
	
	export default{
		mixins: [modal,common,globals],
		components: {
			selectLesson
		},
		data () {
			return {
				type: 1,
				checkAll: false,
				selected: {
					type: 1,
					info: {},
					map_ids: {},
					ids: []
				},				
				data:{
					lid: 0,
					sj_id: 0,
					0:{
						url:'classes?status=[<,2]&pagesize=10000',
						key:'',						
						total:0,
						list:[]
					},
					1: {
						url:'student_lessons?lesson_type=1&with=student,lesson&pagesize=10000',
						key:'',
						total:0,
						list:[]
					},
					2: {
						url:'student_lessons?lesson_type=2&with=student,lesson&pagesize=10000',
						key:'',
						total:0,
						list:[]
					}
				}				
			}
		},
		props: {
			condition: {
                type: String,
                default() {
                    return ''
                }
            },
            allowType:{
                type:Array,
                default(){
                    return [0,1,2]
                }
            },
            mode: {
            	type: String,
            	default: 'attendance'
            }
		},
		watch: {
			type: function (val) {	
				//0:班级，1：1对1，2：1对多
				this.selected.type = val
				this.get_data_list(val)
				if(this.allowType.length>1){
					this.selected.ids = []					
				}
			},
			'modal$.show': function (val) {
				if(val) {
					this.get_data_list(this.type)		
				}
			}			
		},
		mounted () {
			
		},
		methods: {
			setSelected () {
				let selected = this.selected,
					list = this.data[this.type].list,
					ids = selected.ids
					
				if(list.length){
					list.forEach(l=>{
						l.$selected = ids.indexOf(l.student.sid) > -1						
					})					
				}
				
				return this
			},
			getSubjectName (row) {
				let name = ''
				//班课
				if(this.type===0){
					name = this.$filter('subject_name')(row.sj_id)
				}else{
					if(row.lesson){
						//课时包
						if(row.lesson.sj_ids.length>0){
							row.lesson.sj_ids.forEach(s=>{
								name += this.$filter('subject_name')(s)+','
							})
							name = name.substring(0,name.length-1)
						//非课时包
						}else{
							name = this.$filter('subject_name')(row.lesson.sj_id)
						}						
					}
				}
				
				return name
			},
			refreshAll () {
				let types = [0,1,2]
				types.forEach(t=>{
					this.refresh(t)
				})
			},
			refresh (type) {
				let url = this.data[type].url
				if(this.condition){
					url += this.condition
				}
				this.dr().refreshData(url)
				.then(data=>{
					if(type!==0){
						this.data[type].list = data.list.filter(l=>l.student!==null)
					}else{
						this.data[type].list = data.list						
					}
					this.data[type].total = data.total
					this.setSelected()
				})
			},
			get_data_list(type){
				let url = this.data[type].url
				
				if(this.condition){
					url += this.condition
				}
				
				this.dr().getData(url)
				.then(response=>{
					if(type!==0){
						this.data[type].list = response.list.filter(l=>l.student!==null)
					}else{
						this.data[type].list = response.list
					}
					this.data[type].total = response.total
					this.setSelected()
				})
			},
			studentLessonArrangePercent(item){
				return (item.lesson_hours - item.remain_arrange_hours)*100/item.lesson_hours
			},
			classArrangePercent(item){
				return item.attendance_times * 100 / item.lesson_times
			},
			addSelectedIds (item) {
				let [type,ids,index] = [this.type,this.selected.ids,-1]
				if(type!==2){
					this.selected.map_ids = {}
					this.selected.info = item					
					this.clearSelectedId()
					
					if(type===0){
						this.selected.ids.push(item.cid)				
						this.selected.map_ids[item.cid] = item
					}else{
						this.selected.map_ids[item.student.sid] = item
						this.selected.ids.push(item.student.sid)
					}
					
				}else{
					this.selected.info = item
					index = ids.indexOf(item.student.sid)
					
					if(index>-1){
						this.selected.ids.splice(index,1)
						Vue.delete(this.selected.map_ids,item.student.sid)
					}else{
						this.selected.map_ids[item.student.sid] = item
						this.selected.ids.push(item.student.sid)
					}				
					
					this.checkAll = this.selected.ids.length===this.data[2].list.length					
				}
			},
			toggleSelected(item) {
				let type = this.type
				
				if(this.mode=='arrange'&&item.remain_arrange_times==0){
					this.$Message.error('该学员排课记录已满，无法添加排课')
					return
				}
				
				if(type===2){
					let sids = this.selected.ids
					
					if(sids.length>0){
						let index = sids.indexOf(item.sid)
						
						if(!item.$selected&&index>-1){
							let name = this.selected.map_ids[sids[index]].student.student_name
							this.$Message.error('已选择学员【'+name+'】,请勿重复选择')
							Vue.set(item,'$selected',false)
							return false
						}
						
						if(item.lesson){
							let lesson = this.selected.map_ids[sids[0]].lesson
							
							if(item.lesson.sj_ids.length>0){
								if(String(item.lesson.sj_ids)!==String(lesson.sj_ids)){
									this.$Message.error('只能选择相同课时包学员')
									Vue.set(item,'$selected',false)
									return false
								}
							}
							
//							if(item.lesson.sj_id!==lesson.sj_id){
//								this.$Message.error('只能选择相同科目学员')
//								Vue.set(item,'$selected',false)
//								return false
//							}
						}
					}
					
					if(!item.$selected){
						Vue.set(item,'$selected',true)		
					}else{
						Vue.set(item,'$selected',false)
					}
	            }else{
                    this.data[type].list.forEach(item=>{
                        Vue.set(item,'$selected',false)
                    })
                    item.$selected = true
	            }
	            this.addSelectedIds(item)
			},
			clearSelectedId () {				
				this.selected.ids = []
				this.data[2].list.forEach((item)=>{
					item.$selected = false
				})
				this.checkAll = false
			},
			handleCheckAll() {
				let checkAll = this.checkAll				
	        	this.data[2].list.forEach((item)=>{
    				if(!checkAll){
    					this.selected.ids.push(item.student.sid)
    					item.$selected = true
    					this.selected.map_ids[item.student.sid] = item
    				}else{
    					this.selected.map_ids = {}
    					this.clearSelectedId()
    				}
	        	})
	        },
	        formatSex(sex) {
				let map = {0: '未确定', 1: '男', 2: '女'}
				return map[sex]
			},
			filterList (type) {				
				let list = this.data[type].list,			
					lid = this.data.lid,
					sj_id = this.data.sj_id,
					condition = this.condition,
					filter_condition = (item) => {
						//班课
						if(type===0){
							if(lid>0||sj_id>0){
								return (this.data[type].key?item.class_name.indexOf(this.data[type].key) !== -1:true)&&(sj_id>0?item.sj_id===sj_id:true)&&(lid>0?item.lid===lid:true)
							}							
							else{
								return item.class_name.indexOf(this.data[type].key) !== -1
							}
						//一对一、一对多
						}else{
							if(lid>0||sj_id>0){
								return (this.data[type].key?item.student.student_name.indexOf(this.data[type].key) !== -1:true)&&(sj_id>0?(item.lesson.sj_id===sj_id||item.lesson.sj_ids.indexOf(sj_id)>-1):true)&&(lid>0?item.lid===lid:true)	
							}else{
								return item.student.student_name.indexOf(this.data[type].key) !== -1
							}
						}
					}
				if(!/^\s*$/.test(this.data[type].key)||lid>0||sj_id>0){
					list = list.filter(filter_condition)
				}
				return list
			},
	        cancel () {
	        	this.close()
	        	this.clearSelectedId()
	        	this.data[0].list.forEach(item=>{
                    Vue.set(item,'$selected',false)
                })
	        	this.data[1].list.forEach(item=>{
                    Vue.set(item,'$selected',false)
                })
	        },
	        ok () {
	        	this.$emit('on-selected',this.selected)
	        	this.close()
	        }
		},
		computed: {
			selectedTotal () {
	            return this.selected.ids.length
	        },
			classes () {
	            return [
	                `${prefixCls}`,
	                {
	                    [`${prefixCls}-multiple`]: this.type===2,
	                    [`${prefixCls}-single`]: this.type!==2
	                }
	            ];
	        },
	        filter_subjects () {
	        	let list = this.$store.state.gvars.subjects,
	        		result = [],
	        		lid = this.data.lid
	        	if(list.length>0){
	        		result = list
	        		
	        		if(lid>0){
	        			let lesson = this.$store.state.gvars.lessons.find(item=>item.lid == lid)
	        			
	        			if(lesson){
	        				if(lesson.sj_ids.length){
	        					result = result.filter(r=>lesson.sj_ids.indexOf(r.sj_id)>-1)
	        				}else{
	        					result = result.filter(r=>r.sj_id == lesson.sj_id)	        					
	        				}
	        			}
	        		}
	        	}
	        	return result
	        }
		}
	}
</script>
