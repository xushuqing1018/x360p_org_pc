<template>
	<Modal v-drag-modal :mask-closable="false" width="700" v-model="modal$.show" :title="modal$.title">       
      <div class="content-body">
			    <Table 
			    v-loading="'order_items'" 
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
              :page-size="pageSize" 
              :show-sizer="true" 
              :show-total="true" 
              @on-change="pagenation" 
              @on-page-size-change="pagesize"
              >
              </Page>
          </div>
      </div>
			<div slot="footer">
      </div>
  </Modal>
</template>

<script>
	import util from '@/libs/util'
	import moment from 'moment'
  import grid from '@/libs/grid.mixin'
  import modal from '@/libs/modal.mixin'
  import common from '@/libs/common.mixin'
  import globals from '@/libs/globals.mixin'

  export default {
    mixins: [util, grid, modal, common, globals],
    components: {
		},
		props: {
			sid : {
				type: Number,
				default: ()=>{
					return 0
				}
			}
		},
    data () {
      return {
        rest_api: 'order_items',
        pk: 'oi_id',
        column_keys: {
					item_name: {
						title: '缴费项目',
						show: true,
					},
					consume_type: {
						title: '类型',
						show: true
					},
					create_time: {
						title: '下单时间',
						show: true
					},
					paid_amount: {
						title: '实缴金额',
						show: true
					},
					operation: {
						title: '安排课时',
						show: true
					}
        },
        column_render: {
					item_name(h,params) {
						let name = params.row.item_name
						let gtype= params.row.gtype
						let ps = []
						if(gtype==1) {
							ps.push(h('Tag',{
								props: {
									color: 'blue'
								}
							},'物'))
						}else if(gtype==3) {
							ps.push(h('Tag',{
								props: {
									color: '#EF6AFF'
								}
							},'杂'))
						}
						ps.push(name)
						if(params.row.from_lid) {
							ps.push(h('p',{
								class: 'text-info'
							},`课程升级：${this.$filter('lesson_name')(params.row.from_lid)}`))
						}
						return h('div',ps)
					},
					create_time (h,params) {
						return h('span',moment(params.row.create_time).format('YYYY-MM-DD hh:mm'))
					},
					consume_type (h,params) {
						return h('span',this.$filter('consume_type')(params.row.consume_type))
					},
					paid_amount(h,params) {
						return h('span',{
							class: params.row.paid_amount<params.row.subtotal?'text-danger':''
						},this.label_currency+params.row.paid_amount)
					},
					operation (h, params) {
						let add_btn = null
						add_btn = h('Button',{
							'class': {
								'disabled': params.row.order_item_lha.length !== 0
							},
							attrs: {
								'title': '安排课时'								
							},
							props: {
								type: 'text',
								size: 'small',
								icon: 'shuffle'
							},
							on: {
								'click': () => {
									this.arrangeClassHours(params)
								}
							}
						})	
						return h('span',[add_btn])					
					}
				}
      }
    },
    mounted () {
      this.init_data()
    },
    computed: {
    },
    methods: {
      arrangeClassHours (params) {
        	let item = params.row,
					 		student = item.student,
							num = Number(item.nums)+Number(item.present_lesson_hours)
					let lha = {
						int_day: [],
						teach_eid: [],
						lid: 0,
						int_start_hour:'',
						int_end_hour:'',
						week_days: [],
						lesson_type: 2
					}
					lha.int_day.push(item.join_order.paid_time)
					if(item.expire_time) {
						lha.int_day.push(item.expire_time)
					}
					else{
						let end = moment(item.join_order.paid_time).add(60,'days').format('YYYY-MM-DD')
						lha.int_day.push(end)
					}
					lha.lid = item.lid
					lha.lesson_type = this.lesson_type(item.lid)
					item.lha = lha
					this.$Modal.open('dashboard/signup/lesson-hour-arrange.vue@modal',{
						on: {
							'on-success':() => {
								this.init_data()
							}
						},
						props: {
							item : item,
							student:student
						}
					})
					.then(modal => {
						modal.show(util.sprintf('选择上课时段，共 %s 课时', num), 'direct')
					})
      },
			hook_get_param (params) {
        params.sid = this.sid
				params.with = 'student,referer_student,join_order,order_item_lha'
			},
			lesson_type (lid) {
				let lessons = this.$store.state.gvars.lessons,
					result = {}
				if(lid&&lessons.length){
					result = lessons.find(l=>l.lid==lid)||{} 
				}
				return result.lesson_type
			}, 
    },
    watch: {
		},
  }
</script>

<style lang="less" scoped>
</style>