<template>
    <Modal v-drag-modal v-model="modal$.show" :mask-closable="true" width="640" :title="modal$.title">
    	<div>
    		<div class="list-main">
                <div class="list-condition">
                	<Row class="mt-1">
                		<Col span="8">
                            <Input style="width:200px" v-model="params.search_value" :placeholder="'请输入模板名称'" icon="ios-search" @keyup.native="searchData()"></Input>
                		</Col>
                	</Row>
                </div>
                <div class="list-body" style="margin-top:10px;">
                    <div class="list-body-wrap" v-loading.like="'textbooks'">
                        <table class="modal-table">
                            <thead>
                                <tr>
                                    <th><div class="ivu-table-cell">#</div></th>
                                    <th><div class="ivu-table-cell">模板名称</div></th>
                                    <th><div class="ivu-table-cell">添加时间</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="(item,index) in data" :key="item.htts_id">
                                    <td><div class="ivu-table-cell">{{index + 1}}</div></td>
                                    <td><div class="ivu-table-cell">{{item.name}}</div></td>
                                    <td><div class="ivu-table-cell">{{item.create_time|date}}</div></td>
                                </tr>
                                <tr v-if="data.length == 0">
                                    <td colspan="5" style="text-align: center"><p class="empty">没有可用的模板</p></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="list-page clearfix" style="margin-top:10px;">
                        <Page class="pull-right" size="small" :total="total" :show-total="true" :current="pageIndex" :show-sizer="true" :page-size="pageSize" @on-change="pagenation" @on-page-size-change="pagesize"></Page>
                    </div>
                    
                </div>
            </div>
    	</div>
        <div slot="footer">
            <span class="footer-selected pull-left"><i>已选择:</i>{{htts_params.htts_name}}</span>
            <Button type="default" @click="cancel">取消</Button>
            <Button type="primary" @click="ok">确定</Button>
        </div>
    </Modal>
</template>
<script>
import util from '@/libs/util'
import modal from '@/libs/modal.mixin'
import grid from '@/libs/grid.mixin'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'

export default {
	name:'HomeworkTaskTplSettingList',
    mixins: [common,globals,grid,modal],
    props:{
        htts_name:{
            type:String,
            default:''
        },
        htts_id:{
            type:Number,
            default:0
        }
    },
    data() {
        return {
            rest_api: 'homework_task_tpl_settings',
            pk: 'htts_id',
            params:{
	            search_field:'name',
	            search_value:'',
	            order_field:'name',
	            order_sort:'ASC'
	        },
            data: [],
            htts_params: {
                htts_id: this.htts_id,
                htts_name: this.htts_name
            }
        }
    },
	mounted () {
		this.init_data()
	},
    methods: {
        ok(){
            if(this.htts_params.htts_id == 0){
                this.$Message.error('请选择一个模板！')
				return
            }
            
            let homework_task_tpl

            this.data.forEach(item => {
				if(item["htts_id"] == this.htts_params.htts_id){
                    homework_task_tpl = item
                }
            })
            
            this.$emit('on-select',homework_task_tpl)
            this.close()
        },
        cancel(){
            this.close()
        },
		searchData() {
			this.pageIndex = 1;
			this.params.search_field = 'name';
			this.init_data();
        },
        toggleSelected(item){
            if(item.$selected){
                this.ok()
            }else{
                this.data.forEach(item=>{
                    item.$selected = false
                })
                item.$selected = true
                
                this.htts_params.htts_name = item["name"]
                this.htts_params.htts_id = item["htts_id"]
            }
        },
    }
}
</script>