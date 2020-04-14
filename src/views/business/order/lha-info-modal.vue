<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="900">
		<Card>
            <p slot="title">课时安排如下:</p>
            <p>
                <Tag type="border" v-for="(v,k) in init_lha_obj" :key="k">{{k}} ({{v.join(',')}})</Tag>
            </p>
        </Card>
        <div style="text-align: right;margin-top: 10px;">
            <Button type="primary" :loading="saving" @click="ok">按课时安排创建排课记录</Button>
        </div>
        <Card class="mt-3">
            <p slot="title">排课记录如下：</p>
            <div class="content">
	            <div class="content-body">
	                <Table 
                        v-loading="'course_arranges'"
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

	            <div class="content-footer" style="margin-top: 10px;text-align: right;">
	                <div class="pagenation">
	                    <Page :total="total" 
                            :current="pageIndex" 
                            :show-sizer="true" 
                            :page-size="pageSize" 
                            :show-total="true" 
                            @on-change="pagenation" 
                            @on-page-size-change="pagesize">
                        </Page>
	                </div>
	            </div>    
	        </div>
        </Card>
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

	export default {
		mixins: [grid,modal,common,globals],
		props: {
			info: {
				type:Object,
				default:()=>{
					return {}
				}
			}
		},
		data() {
			return {
                rest_api: 'course_arranges/0/course_arrange_by_oiid?oi_id=' + this.info.oi_id + '&order_field=int_day&order_sort=desc',
                column_keys:{        
                    branch_name:{
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
                    consume_lesson_hour:{
                        title:'扣课时数',
                        show:true
                    },
                    teach_name:{
                        title:this.$filter('translate')('老师'),
                        show:true,
                    },
                    cr_name:{
                        title:'教室',
                        show:true
                    },
                    tbs: {
                        title: '授课内容',
                        show: true,
                        width: 200
                    }
                },
                column_render: {
                   tbs (h,params) {
                       let result = '-'
                       let book = params.row.textbook
                       let section = params.row.textbook_section
                       if(book) {
                           result = book.tb_name
                       }
                       if(section) {
                           result += `：第${section.sort}章${section.section_title}`
                       }
                       return h('span',result)
                   },
                   int_day(h,params){
                       return h('span',params.row.int_day)
                   },
                   time_section(h,params){
                       return h('span',params.row.time_section)
                   }
                }
			}
        },
        mounted () {
			this.init_data()
		},
        computed:{
            init_lha_obj(){
                let lha_obj = {}

				this.info.arrange_detail.forEach(d => {
					let k = this.$filter('int_hour')(d.int_start_hour)+'-'+this.$filter('int_hour')(d.int_end_hour)
					if(lha_obj[k]) {
						lha_obj[k].push(d.int_month)
					}
					else {
						lha_obj[k] = []
						lha_obj[k].push(d.int_month)
					}
                })
                
                return lha_obj
            }
        },
		methods: {
			ok() {
				this.$rest('order_item_lhas/0/cas')
				.post({ oi_id : this.info.oi_id})
				.success(res => {
					this.$Message.success('同步成功')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
            }
		}
	}
</script>