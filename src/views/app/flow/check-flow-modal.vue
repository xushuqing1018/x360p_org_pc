<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :width="800" :mask-closable="false">
		<Form :label-width="100" label-position="right" ref="form" v-if="modal$.show">		
			<div :style="'width: 700px;margin-left: 30px;' + computed_div_class">	
                <Row>
					<Col class="col-class">
						<Steps :current="current" direction="vertical">
                            <Step :title="item.check_result == 1 ? '已审核' : computed_is_check(item) ? '审核中': '待审核'" v-for="(item,index) in data" :key="index">
                                <div class="ivu-steps-content" style="margin-left: 3px;">
                                    <div style="margin-bottom:10px;" v-if="item.fts_id != 0"><span>步骤：{{item.fts_id != 0 ? item.flow_type_step.step_name : ''}}</span></div>
                                    <div v-if="item.check_eid != 0" style="margin-bottom:10px;"><span>审核人：{{item.check_eid | ename}}</span></div>
                                    <div v-if="item.check_result != 0">
                                        <span>审核结果：</span>
                                        <div :class="'ivu-tag ivu-tag-'+computed_check_result_color(item.check_result)+' ivu-tag-border ivu-tag-checked'">
                                            <span :class="'ivu-tag-text ivu-tag-color-' + computed_check_result_color(item.check_result)">{{computed_check_result(item.check_result)}}</span>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="computed_is_check(item) || item.check_remark != '' || item.flow_comment.length > 0 || item.flow_file.length > 0" style="margin-bottom:10px;">
                                    <Tabs>
                                        <TabPane label="审核批注" name="remark" v-if="item.check_remark != '' || computed_is_check(item)">
                                            <div class="ivu-steps-content" v-if="item.check_remark != ''">
                                                <Card style="height:65px;">
                                                    <div class="ivu-steps-content-class">
                                                        <p style="color: #808a96;">{{item.check_remark}}</p>
                                                    </div>
                                                </Card>
                                            </div>
		                            		<Input class="input-textarea-class" v-if="computed_is_check(item)" type="textarea" placeholder="审核批注" v-model="info.check_remark" :autosize="{minRows:3,maxRows:4}"></Input>
		                            	</TabPane>
		                            	<TabPane label="流程评论" name="comment" v-if="item.flow_comment.length > 0 || computed_is_check(item)">
		                            		<div class="ivu-steps-content" v-if="item.flow_comment.length > 0">
                                                <Card style="height:65px;">
                                                    <div class="ivu-steps-content-class">
                                                        <p style="color: #808a96;">{{item.flow_comment[0].content}}</p>
                                                    </div>
                                                </Card>
                                            </div>
                                            <Input class="input-textarea-class" v-if="computed_is_check(item)" type="textarea" placeholder="流程评论" v-model="info.flow_comment.content" :autosize="{minRows:3,maxRows:4}"></Input>
		                            	</TabPane>
                                        <TabPane label="流程附件" name="file" v-if="item.flow_file.length > 0  || computed_is_check(item)">
                                            <file-item :list="item.flow_file" v-if="item.flow_file.length > 0"></file-item>
		                            		<review-upload ref="upload" v-model="info.flow_step_file" style="margin-top:0px !important;" v-if="computed_is_check(item)">
		                                    </review-upload>
		                            	</TabPane>
		                            </Tabs>
                                </div>
                                <div v-if="computed_is_check(item)" style="margin-left: 3px;margin-bottom: 10px;">
                                    <RadioGroup v-model="info.check_result" type="button">
                                        <Radio label="1">
                                            <span>通过</span>
                                        </Radio>
                                        <Radio label="2">
                                            <span>驳回</span>
                                        </Radio>
                                        <Radio label="3">
                                            <span>转给其他人处理</span>
                                        </Radio>
                                        <Radio label="4" v-if="item.flow_type.flow_step_type == 0">
                                            <span>下一步审核</span>
                                        </Radio>
						            </RadioGroup>
                                    <Select v-model="info.next_step_file.check_eid" :placeholder="info.check_result == 3 ? '请选择审核人' : '请选择下一步审核人'" v-if="computed_check_eid(item,index)" style="width:160px;margin-left: 10px;">
							    	    <Option :value="item.eid" v-for="(item,index) in computed_employees(item,index)" :key="index">{{item.ename}}</Option>
							        </Select>
                                    <CheckboxGroup v-model="allow_free" class="ml-3" style="margin-top: 10px;float: right;margin-right: 140px;" v-if="computed_allow_free(item,index)">
                	            	    <Checkbox class="mb-0" :label="1">自由选择</Checkbox>
                	                </CheckboxGroup>
                                </div>
                            </Step>
                        </Steps>
					</Col>
				</Row>
			</div>
		</Form>
		
		<div slot="footer">
            <div class="pull-left text-info footer-class" v-if="false">
				<Checkbox v-model="iscopy" :true-value="1" :false-value="0"></Checkbox>
				抄送给他人
                <Select v-model="info.flow_step_copy.eid" placeholder="请选择抄送人" v-if="iscopy == 1" style="width:140px;margin-left: 10px;">
				    <Option :value="item.eid" v-for="(item,index) in employees" :key="index">{{item.ename}}</Option>
				</Select>
			</div>
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
    import common from '@/libs/common.mixin'
    import globals from '@/libs/globals.mixin'
    import store from '@/store'
	
    import SelectEmployee from 'c%/SelectEmployee.vue'
    import reviewUpload from 'c%/reviewUpload.vue'
    import FileItem from 'c%/FileItem.vue'
    
    const check_result_title = {1:'审核通过',2:'驳回',3:'转给其他人处理'}
    const check_result_color = {1:'green',2:'red',3:'blue'}

	export default{
		mixins: [ modal, common,globals ],
		components: {
            SelectEmployee,
            reviewUpload,
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
                info: {
                    check_result: '1',
                    check_remark: '',
                    flow_comment:{
                        content:''
                    },
                    flow_step_file:[],
                    flow_step_copy:{
                        fs_id:0,
                        eid:0
                    },
                    next_step_file:{
                        check_eid:0,
                        fs_id:0
                    },
                    id:0,
                    add_step_file:{}
                },
                data:[],
                employees: store.state.gvars.employees||[],
                allow_free: [],
                iscopy:0,
                check_eid: 0,
                ft_id:0,
                current:0,
                isLast:false
			}
        },
        computed: {
            computed_employees() {
                return function(item,index) {
                    let eids = []

                    if (item.flow_type.flow_step_type != 0) {
                        if (this.info.check_result == "1") {
                            eids = index+1 < this.data.length ? this.data[index+1].flow_type_step.eids : []
                            this.info.next_step_file.fs_id = index+1 < this.data.length ? this.data[index+1].fs_id : 0
                        }
                        if (this.info.check_result == "3"){
                            eids = item.flow_type_step.eids
                        }  
                    }
                    
                    
                    if (eids.length > 0 & this.allow_free[0] != 1) {
                        return this.employees.filter(item => eids.indexOf(item.eid) > -1)
                    }
                    return this.employees
                }   
            },
            computed_allow_free(){
                return function(item,index) {
                    let allow_free = false

                    if (item.flow_type.flow_step_type != 0) {
                        if (this.info.check_result == "1") {
                            allow_free = index+1 < this.data.length ? this.data[index+1].flow_type_step.allow_free : false
                        }
                        if (this.info.check_result == "3"){
                            allow_free = item.flow_type_step.allow_free
                        }  
                    }

                    return allow_free
                }   
            },
            computed_check_eid(){
                return function(item,index) {
                    let check_eid = false

                    if ((this.info.check_result == 1 && index+1 != this.data.length)|| this.info.check_result == 3 || this.info.check_result == 4) {
                        check_eid = true
                    } 

                    this.isLast = index+1 == this.data.length

                    return check_eid
                }   
            },
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
            },
            computed_div_class(){
                let div_class = ''
                if (this.data.length > 2) {
                    div_class = 'max-height: 600px;overflow: auto;padding-right: 10px;'
                }
                return div_class
            }
        },
        filters: {
            limit_type: function (value) {
                return limit_type_title[value]
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
                            this.check_eid = data.check_eid
                            this.info.id = data.fs_id
                            this.info.flow_step_copy.fs_id = data.fs_id
                            this.ft_id = data.ft_id
                            this.current = index
                        }
                    })
				})
            },
			ok () {
                if(this.check_eid != this.eid$){
					this.$Message.error('无该流程步骤审核权限')
					return
                }

				if((this.info.check_result == "1" && !this.isLast && this.info.next_step_file.check_eid == 0) || (this.info.check_result == "4" && this.info.next_step_file.check_eid == 0)){
					this.$Message.error('请选择下一步审核人')
					return
                }

                if(this.info.check_result == "3" && this.info.next_step_file.check_eid == 0){
                    this.$Message.error('请选择审核人')
					return
                }

                if(this.iscopy == 1 && this.info.flow_step_copy.eid == 0){
                    this.$Message.error('请选择抄送人')
					return
                }

                if(!/^\s*$/.test(this.info.flow_comment.content) && typeof(this.info.flow_comment.content) != "undefined"){
                    let flow_comment = {
                        fid: this.fid,
                        ft_id: this.ft_id,
                        fs_id: this.info.id,
                        eid: this.check_eid,
                        content: this.info.flow_comment.content
                    }
                    this.info.flow_comment = flow_comment
                }else{
                    this.info.flow_comment = {}
                }

                if(this.info.check_result == "3"){
                    this.info.check_remark = ''
                    this.info.flow_comment = {}
                    this.info.flow_step_file = []
                    this.info.flow_step_copy = {}
                    this.info.next_step_file.fs_id = this.info.id
                }

                if(this.info.check_result == "4"){
                    let add_step_file = {
                        fid:this.fid,
                        ft_id:this.ft_id,
                        check_eid:this.info.next_step_file.check_eid,
                        flow_step:this.data.length + 1,
                        fts_id:0
                    }
                    this.info.add_step_file = add_step_file
                    this.info.check_result = "1"
                    this.info.next_step_file = {}
                }

                if (this.iscopy == 0) {
                    this.info.flow_step_copy = {}
                }
				
				let [uri,method,msg] = ['flow_steps/do_check','post','审批成功']
				
				this.$rest(uri)[method](this.info)
				.success(data=>{
					this.$Message.success(msg)
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'审批失败~')
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

    .footer-class .ivu-select-placeholder,.footer-class .ivu-select-selected-value{
        float: left;
    }

    .input-textarea-class .ivu-input{
        height: 86px !important;
        min-height: 86px !important;
    }
</style>