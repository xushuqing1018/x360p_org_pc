<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :width="800" :mask-closable="false">
		<Form :label-width="100" label-position="right" ref="form" v-if="modal$.show">		
			<div style="width: 700px;margin-left: 30px;max-height: 600px;overflow: auto;padding-right: 10px;">	
                <Row>
					<Col class="col-class">
						<Steps :current="current" direction="vertical">
                            <Step :title="item.check_status == 1 ? '已审核' : computed_is_check(item) ? '审核中': '待审核'" v-for="(item,index) in data" :key="index">
                                <div class="ivu-steps-content" style="margin-left: 3px;">
                                    <div style="margin-bottom:10px;"><span>步骤：{{item.flow_step}}</span></div>
                                    <div style="margin-bottom:10px;" v-if="item.check_eid != 0"><span>审核人：{{item.check_eid | ename}}</span></div>
                                    <div v-if="item.check_result != 0">
                                        <span>审核结果：</span>
                                        <div :class="'ivu-tag ivu-tag-'+computed_check_result_color(item.check_result)+' ivu-tag-border ivu-tag-checked'">
                                            <span :class="'ivu-tag-text ivu-tag-color-' + computed_check_result_color(item.check_result)">{{computed_check_result(item.check_result)}}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style="margin-bottom:10px;" v-if="item.check_remark != '' || item.flow_comment.length > 0 || item.flow_file.length > 0">
                                    <Tabs>
                                        <TabPane label="审核批注" name="remark" v-if="item.check_remark != ''">
                                            <div class="ivu-steps-content">
                                                <Card style="height:65px;">
                                                    <div class="ivu-steps-content-class">
                                                        <p style="color: #808a96;">{{item.check_remark}}</p>
                                                    </div>
                                                </Card>
                                            </div>
                                        </TabPane>
		                            	<TabPane label="流程评论" name="comment" v-if="item.flow_comment.length > 0">
		                            		<div class="ivu-steps-content">
                                                <Card style="height:65px;">
                                                    <div class="ivu-steps-content-class">
                                                        <p style="color: #808a96;">{{item.flow_comment[0].content}}</p>
                                                    </div>
                                                </Card>
                                            </div>
                                        </TabPane>
                                        <TabPane label="流程附件" name="file" v-if="item.flow_file.length > 0">
                                            <file-item :list="item.flow_file"></file-item>
		                            	</TabPane>
		                            </Tabs>
                                </div>
                            </Step>
                        </Steps>
					</Col>
				</Row>
			</div>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
    import common from '@/libs/common.mixin'
    import globals from '@/libs/globals.mixin'
    import store from '@/store'
	
    import FileItem from 'c%/FileItem.vue'

    const check_result_title = {1:'审核通过',2:'驳回',3:'转给其他人处理'}
    const check_result_color = {1:'green',2:'red',3:'blue'}
	
	export default{
		mixins: [ modal, common,globals ],
		components: {
            FileItem
        },
        props: {
			fid: {
            	type: Number,
            	default: 0
            }
        },
		data () {
			return {
                data:[],
                current:-1
			}
        },
        computed: {
            computed_is_check(){
                return function(item) {
                    let is_check = false

                    if ((item.check_result == 0 || item.check_result == 3) && item.check_eid != 0) {
                        is_check = true
                    } 

                    return is_check
                }   
            },
            computed_check_result(){
                return function(check_result) {
                    return check_result_title[check_result]
                }   
            },
            computed_check_result_color(){
                return function(check_result) {
                    return check_result_color[check_result]
                }   
            }
        },
		mounted () {
			this.init_data()
		},
		methods: {
            init_data(){
                this.$rest('flow_steps?with=flow_type,flow_comment,flow_file,flow,flow_type_step&order_field=fs_id&order_sort=asc&fid=' + this.fid).get()
				.success(data=>{
                    this.data = data.list
                    this.data.forEach((data,index)=>{
                        if((data.check_result == 0 || data.check_result == 3) && data.check_eid != 0){
                            this.current = index
                        }
                    })
                    if(this.current == -1){
                        this.current = this.data.length
                    }
				})
            }
		}
		
	}
</script>

<style>
    .col-class .ivu-steps-vertical .ivu-steps-main {
        min-height: 47px;
        overflow: visible;
        display: block;
        margin-left: 40px;
    }
    
    .col-class .ivu-steps-horizontal .ivu-select-dropdown{
        top:70px !important;
        left:-35px !important;
    }

    .input-textarea-class .ivu-input{
        height: 86px !important;
        min-height: 86px !important;
    }

    .ivu-steps-content-class .p-3{
        padding: 0px !important;
    }
</style>