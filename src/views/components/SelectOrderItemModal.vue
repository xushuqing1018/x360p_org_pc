<template>
    <Modal v-drag-modal v-model="modal$.show" :mask-closable="false" width="600" :title="modal$.title">
    	<div class="select-list-single">
    		<div class="list-main">
                <div class="list-body">
                    <div class="list-body-wrap">
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
                            @on-sort-change="sortChange"
                            @on-row-click="selectRow"
                            @on-row-dblclick="selectRowAndOk"
                            > 
                            </Table>
                    </div>

                    <div class="list-page clearfix m-t">
                        <Page 
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
            </div>
    	</div>
        <div slot="footer">
            <span class="footer-selected pull-left"><i>已选择:</i>{{labelText}}</span>
            <Button type="default" @click="close">取消</Button>
            <Button type="primary" @click="ok">确定</Button>
        </div>
    </Modal>
</template>
<script>
import util from '@/libs/util'
import grid from '@/libs/grid.mixin'
import modal from '@/libs/modal.mixin'
import directive from '@/libs/directive.mixin'

export default {
	name:'OrderItemModal',
    mixins: [ grid, modal, directive ],
    props: {
        sid: {
            type: [String,Number],
            default: ''
        }
    },
    computed:{
        labelText(){
            if(!this.currentRow){
                return ''
            }
            return this.currentRow.item_name
        }
    },
	data() {
		return {
            rest_api: '',
            pk: 'oi_id',
            currentRow:null,
            search_field: {
                lid: '',
                sid: 0,
                create_time: [],
                paid_time: [],
                order_no: '',
                consume_type: -1,
                is_from_lid: -1,
                gtype: [0],
                is_referer: -1,
                referer_sid: 0,
                referer_teacher_id: 0,
                referer_eid: 0,
                eid: 0
            },
            column_keys: {
                sid: {
                    title: '学员',
                    show: true
                },
                item_name: {
                    title: '缴费项目',
                    show: true,
                    width: 200
                },
                nums: {
                    title: '数量',
                    show: true
                },
                order_no: {
                    title: '订单号',
                    show: true,
                    width: 150
                },
                create_time: {
                    title: '下单时间',
                    show: false
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
                order_no (h,params) {
                    return h('span',{
                        attrs: {
                            class: 'text-info'
                        }
                    },params.row.join_order.order_no)
                },
                sid (h,params) {
                    return h('span',params.row.student.student_name)
                },
                nums (h,params) {
                    return h('span',util.float(params.row.nums))
                }
            }
		}
	},
    methods: {
        ok(){
            if(!this.currentRow){
                this.$Message.error('没有选中任何项目')
                return
            }
            this.$emit('select',this.currentRow);
            this.close()
        },
        selectRow(row,index){
            this.currentRow = util.copy(row)
        },
        selectRowAndOk(row,index){
            this.currentRow = util.copy(row)
            this.ok()
        },
        getStudentOrderItems(sid){
            this.search_field.sid = sid
            this.rest_api = 'order_items'
            this.init_data()
        },
        hook_get_param (params) {
            let search_obj = util.copy(this.search_field)
            for(let o in search_obj) {
                let property = search_obj[o]
                if(o=='create_time'){
                    if(property!=','&&property.length>0){
                        params[o] = util.sprintf('[Between,%s]',property.join(','))
                    }												
                }else if(o=='paid_time'){
                    if(property!=','&&property.length>0){
                        params['start_date'] = property[0]
                        params['end_date']   = property[1]
                    }
                }else if(o=='is_from_lid'){
                    if(property==0) {
                        params['form_lid'] = 0
                    }else if(property==1) {
                        params['from_lid'] = '[>,0]'
                    }
                }else if(o=='gtype'){
                    if(property.length>0) {
                        params[o] = util.sprintf('[in,%s]',property.join(','))
                    }
                }else if(o=='is_referer'){
                    if(property>-1) {
                        params[o] = property
                    }
                }else{
                    if(property&&property!=-1){
                        params[o] = property	
                    }		
                }									
            }
            params.from = 'payment'
            params.with = 'student,join_order,order_item_lha'
        }
    },
    watch: {
        
    }
}
</script>