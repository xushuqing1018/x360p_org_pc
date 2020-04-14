<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="1100">
        
		<Form :label-width="70" class="filter-form row">
			<Form-item label="学员姓名" class="col-sm-4">
				<select-student v-model="search_field.sid"></select-student>
			</Form-item>
		</Form>
		<div class="content-body">
	        <Table  
		        :page-size="pageSize" 
		        :page="pageIndex" 	
		        :stripe="true" 
		        :show-header="true" 
		        :data="data" 
		        :columns="columns" 
		        :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		        :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		        @on-sort-change="sortChange">
	        </Table>
	    </div>
	    <div class="content-footer">
	        <div class="clearfix">
	            <Page 
	            	class="pull-right mt-2"
	            	size="small"
		            :total="total" 
		            :current="pageIndex" 
		            :show-sizer="true" 
		            :page-size="pageSize" 
		            :show-total="true" 
		            @on-change="pagenation" 
		            @on-page-size-change="pagesize"
		            >
	            </Page>
	        </div>
	    </div>  
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
    import globals from '@/libs/globals.mixin'
    import SelectStudent from 'c%/SelectStudent.vue'
    
	export default {
		mixins: [grid,modal,common,globals],
		components: {
			SelectStudent
		},
		data() {
			return {
                rest_api: 'course_arrange_candidatess',
				search_field: {
					sid: 0
				},
				column_keys:{
                	student_name: {
                		title: '学员',
                		show: true
                	},
                    bid:{
                        title:'校区',
                        show:false,
                    },
                    pj_id:{
                        title:'项目',
                        show:false
                    },
                    lid:{
                        title:'班级/课程',
                        show:true
                    },
                    sj_id:{
                        title:'科目',
                        sortable:'custom',
                        show:false
                    },
                    int_day:{
                    	title:'日期',
                    	sortable:'custom',
                    	show:true
                    },				
                    time_section:{
                    	title:'时段',
                   		show:true
                    },
                    consume_lesson_hour:{
                        title:'扣课时数',
                        show:true
                    },
                    int_start_hour:{
                    	title:'开始时间',
                    	show:false
                    },
                    int_end_hour:{
                    	title:'结束时间',
                    	show:false
                    },
                    teach_eid:{
                        title:this.$filter('translate')('老师'),
                        sortable:'custom',
                        show:true,
                    },
                    cr_id:{
                        title:'预约座位',
                        show:true
                    },
                    bk_time:{
                    	title: '预约时间',
                    	show: true
                    },
                    is_attendance:{
                    	title:'考勤',
                    	sortable:'custom',
                    	show:true
                    },
                    operation:{
                    	title:'操作',
                    	show:true
                    }
                },
                column_render: {
            	    int_start_hour (h,params) {
            	    	return h('span',this.$filter('int_hour')(params.row.int_start_hour))
            	    },
            	    int_end_hour (h,params) {
            	    	return h('span',this.$filter('int_hour')(params.row.int_end_hour))
            	    },
            	    teach_eid (h,params) {
            	    	return h('span',this.$filter('ename')(params.row.teach_eid,'-'))
            	    },
            	    cr_id (h,params) {
            	    	let cr_id = params.row.cr_id
            	    	let bk_seat = params.row.bk_seat
            	    	let seat = ''
				    	if(bk_seat&&bk_seat!=='0-0') {
				    		let arr = bk_seat.split('-')
				    		seat = arr[0]+'排'+arr[1]+'座'
				    	}
            	    	if(cr_id) {
            	    		return h('span',this.$filter('classroom_name')(cr_id) +' '+ seat)
            	    	}else{
            	    		return h('span','-')
            	    	}
            	    },
            	    lid(h,params) {
            	    	let map = {0:'班',1:'一',2:'多'}
            	    	let type = params.row.lesson_type
            	    	let tag = h('Tag',{
            	    		props: {
            	    			color:type==0?'blue':'green'
            	    		}
            	    	},map[type])
            	    	let name = ''
            	    	if(type==0) {
            	    		if(params.row.one_class) {
            	    			name = params.row.one_class.class_name
            	    		}
            	    	}else{
            	    		name = this.$filter('lesson_name')(params.row.lid)
            	    	}
            	    	return h('div',[tag,' ',name])
            	    },
                    is_attendance(h,params){
                    	let map_tag =  {
	                    		0:{color:'default',label: '未考勤'},
	        	    			1:{color:'green',label: '已考勤'},
	        	    			2:{color:'red',label: '请假'}
	                    	}
	                    	let status = params.row.is_attendance
	                    	if(params.row.is_leave) {
	                    		status = 2
	                    	}
	                    	let tag = map_tag[status]
	                    return h('Tag',{
	                        props:{
	                            color: tag.color
				    		}
	                    },tag.label)
                    },
                    operation (h,params) {
                        if(params.row.is_attendance===0){
                            let operate = h('Button',{
						    	props: {
						    		type: 'ghost',
                                    size: 'small',
                                    icon: 'ios-trash'
						    	},
						    	on: {
						    		click: () => {
						    			this.delInfo(params.row)
						    		}
						    	}
						    },[
						    	'删除'
						    ])
						    return operate
                        }
            	    },
                }
            }
        },
		mounted() {
			this.init_data()
		},
		methods: {
            delInfo (row) {
            	this.confirm('您确定要取消这条约课吗?')
                .then(()=>{
                    this.$http.delete('course_arrange_candidatess/'+row.cac_id)
                    .then(res => {
                        this.$Message.success('删除成功')
                        this.init_data()
                    },res => {
                        this.error(res.body.message)
                    })
                })       
            },
			hook_get_param(params) {
				let search_obj = util.copy(this.search_field)
			    for(let o in search_obj) {
			    	let property = search_obj[o]
			    	if(property&&property!='-1'){
			    		params[o] = property
			    	}
			    }
			}
		}
	}
</script>