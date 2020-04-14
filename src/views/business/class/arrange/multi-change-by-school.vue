<template>
	<Modal v-drag-modal :mask-closable="false" width="800" v-model="modal$.show" :title="modal$.title">
		<Form :label-width="80">
            <span>将本校区 日期</span>&nbsp;
			<Date-picker type="date" v-model="oldDate" format="yyyy-MM-dd" placeholder="选择日期" :show-week-label="true"></Date-picker>&nbsp;&nbsp;&nbsp;
            <span>的所有排课 调整到新日期</span>&nbsp;
            <Date-picker type="date" v-model="newDate" format="yyyy-MM-dd" placeholder="选择日期" :show-week-label="true"></Date-picker>
		</Form>

		<div class="x-arrange-box">
			<div class="ivu-table-cell text-center" v-if="loading">稍等，正在加载排课记录...~</div>
			<div class="content-body">
	            <Table 
                    v-loading="'course_arranges'"
                    :show-header="true" 
                    :data="data" 
                    :columns="columns" > 
	            </Table>
	        </div>

	        <div class="content-footer">
	            <span>共 {{total}} 条</span>
	        </div>
		</div>		
		
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	import DateRangePicker from 'c%/DateRangePicker.vue'
	
	export default{
        mixins: [grid,common, modal,globals ],
		components: {
			DateRangePicker
		},
        data () {
			return {
				loading:false,
				total: 0,
                data: [],
                oldDate: "",
				newDate: "",
				column_keys:{            	
                	bid:{
                	    title:'校区',
                	    show:true,
                	},
                	int_day:{
                		title:'日期',
                		show:true
                	},				
                	time_section:{
                		title:'时段',
               			show:true
                	},
                	teach_eid:{
                	    title:this.$filter('translate')('老师'),
                	    show:true,
                	},
                	teach_object:{
                	    title:'授课对象',
                	    show:true,
                	    width: 200
                	},
                	cr_id:{
                	    title:'教室',
                	    show:true
                	}
				},
				column_render: {
            		teach_object(h,params){
			    	    let row = params.row
			    	    if(row.lesson_type == 0){        	
			    	    	if(row.is_trial == 1||row.is_makeup==1){
							let name = '试'
							if(row.is_makeup ==1){
								name='补'
							}
			    	    		return h('div',[
					                h('Tag',{
					                    props:{
					                        color:'yellow'
					                    }
					                },name),
					                h('Tag',row.name||'')
					            ])
			    	    	}else{
			    	    		return h('div',[
					                h('Tag',{
					                    props:{
					                        color:'blue'
					                    }
					                },'班'),
					                h('Tag',row.one_class!=null?row.one_class.class_name:'')
					            ])
			    	    	}        	

			    	    }else{
			    	        let tag,
			    	            students = [],
                	            sub_elements = []
			    	        if(row.is_trial){
			    	            tag = h('Tag',{
			    	                props:{
			    	                    color:'yellow'
			    	                }
			    	            },'试:'+row.name)
			    	        }else{
			    	            if(row.lesson_type == 1){
			    	                tag = h('Tag',{
			    	                    props:{
			    	                        color:'green'
			    	                    }
			    	                },'一')
			    	            }else if(row.lesson_type == 2){
			    	                tag = h('Tag',{
			    	                    props:{
			    	                        color:'green'
			    	                    }
			    	                },'多')
			    	            }
			    	        }
                	        if(row.is_makeup){
                	            sub_elements.push(
                	                h('Tag',{
                	                    props:{
                	                        color:'yellow'
                	                    }
                	                },'补')
                	            )
                	        }
                	        sub_elements.push(tag)


			    	        row.students.forEach(s=>{
			    	            students.push(h('Tag',s.student.student_name))
			    	        })

                	        sub_elements.push(h('span',students))

			    	        return h('div',sub_elements)

			    	    }
		        	}
            	}
			}
		},
		watch: {
			'oldDate': function (val) {
				this.getCourseArrange()	
			}
		},
		methods: {
			getCourseArrange () {
				let oldDate = new Date(this.oldDate)
                let oldDateForMat = oldDate.getFullYear() + '-' + (oldDate.getMonth() + 1) + '-' + (oldDate.getDate() > 9 ? oldDate.getDate() : "0" + oldDate.getDate())
                
				this.loading = true

				this.$rest('course_arranges')
				.get({
                    with:'one_class,students,textbook,textbook_section,create_employee',
                    is_attendance:0,
                    int_day:'[Between,'+oldDateForMat+','+oldDateForMat+']'

                })
				.success(response=>{
					this.loading = false
					this.data = response.list
					this.total = response.total
				})
				.error(response=>{
					this.loading = false
				})
			},
			ok () {				
				let oldDate = new Date(this.oldDate)
				let old_day = oldDate.getFullYear() + '-' + (oldDate.getMonth() + 1) + '-' + (oldDate.getDate() > 9 ? oldDate.getDate() : "0" + oldDate.getDate())
				let newDate = new Date(this.newDate)
				let new_day = newDate.getFullYear() + '-' + (newDate.getMonth() + 1) + '-' + (newDate.getDate() > 9 ? newDate.getDate() : "0" + newDate.getDate())
				
				if(this.oldDate.length == 0){
					this.$Message.error('请选择原日期')
					return
				}
				if(this.newDate.length == 0){
					this.$Message.error('请选择新日期')
					return
				}

				let params = {old_day : old_day,new_day : new_day};

				this.$rest('course_arranges/batch_day_course')
				.post(params)
				.success(data=>{
					this.$Message.success('调课成功')
					this.$emit('on-success')
					this.close()
				})
				.error(response=>{
					this.error(response.body.message||'调课失败~','调课操作提示')
				})
			}
		}
	}	
</script>

<style lang="less" scoped>
	.content-body{
		height: 290px;
		overflow: auto;
		margin-top: 10px;
	}
	.x-arrange-item{
		display: flex;
		font-size: 14px;
		align-items: center;
		padding: 0 20px;
		span, p{
			line-height: 1.5em;
		}
		.item-center{
			flex: 1
		}
	}
	.ivu-table-wrapper{
		min-height:0px;
	}
</style>