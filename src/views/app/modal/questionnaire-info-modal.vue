<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="1200">
        <div>
            <Alert show-icon type="success">
                <Icon type="ios-lightbulb-outline" slot="icon"></Icon>
                <div slot="desc">
                    已提交人数：
                    <span class="infoNums">{{info.submitted.length}}</span>
                    ，未提交人数：
                    <span class="infoNums">{{info.un_submitted.length}}</span>
                    ，总人数：
                    <span class="infoNums">{{info.sum_submitted.length}}</span>
                </div>
            </Alert>
        </div>
		<div style="max-height: 800px;overflow: auto;">
            <table class="modal-table" v-if="info.questionnaire_subject[0].valid_num != 0">
	        	<tbody>
	        		<template v-for="item in info.questionnaire_subject">
                        <template v-if="item.stype == 0 || item.stype == 1">
                            <tr>
                                <td colspan="3">
                                    <Alert>
                                        <Tag :color="item.stype == 0 ? 'green' : 'yellow'">{{item.stype == 0 ? '单选' : '多选'}}</Tag>
                                        <span>{{item.title}}</span>
                                        <span style="position: absolute;left: 700px;bottom: 15px;">小计</span>
                                        <span style="position: absolute;left: 800px;bottom: 15px;">比例</span>
                                    </Alert>
                                </td>
                            </tr>
                            <tr v-for="(v,i) in item.choices" :key="i">
                                <td width="700">
                                    <div class="ivu-table-cell">
                                        <span style="font-weight: bold;">{{i+1}}、</span>
                                        <span v-if="v.content_type == 0">{{v.content}}</span>
                                        <img v-if="v.content_type == 1" :src="v.content" width="100">
                                        <div v-if="v.content_type == 2" v-html="v.content"></div>
                                    </div>
                                </td>
                                <td width="100">
                                    <div class="ivu-table-cell">
                                        {{v.select_num}}
                                    </div>
                                </td>
                                <td>
                                    <div class="ivu-table-cell">
                                        <Progress :percent="init_percent(v.select_num,item.valid_num)">
                                            <span>{{init_percent(v.select_num,item.valid_num)}}%</span>
                                        </Progress>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="3">
                                    <Alert show-icon>
                                        <Icon type="information-circled" slot="icon"></Icon>
                                        本题有效填写人次：
                                        <span style="font-weight: bold;">{{item.valid_num}}</span>
                                    </Alert>
                                </td>
                            </tr>
                        </template>
	        		</template>
	        	</tbody>
	        </table>
            <div v-else class="mescroll-empty">
                <img src="https://sp1.xiao360.com/static/img/student/nodata.png" />
                <p class="empty-tip">还没有学员填写调查问卷哦~</p>
            </div>
        </div>
		<div slot="footer">
			<Button type="ghost" @click="modal$.show=false">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'

	export default {
        mixins: [common,modal],
        props:{
            qid:{
                type:Number,
                default:0
            },
            bind_id:{
                type:Number,
                default:0
            },
            bind_table:{
                type:String,
                default:''
            }
        },
		data() {
			return {
                info:{
                    questionnaire_subject:[{
                        valid_num:0
                    }],
                    submitted:[],
                    un_submitted:[],
                    sum_submitted:[]
                }
			}
        },
        computed:{
            init_percent(){
                return function(select_num,valid_num){
                    return Math.round(select_num / valid_num * 10000) / 100.00
                }
            }
        },
        mounted(){
            this.init_data()
        },
		methods: {
			init_data(){
                this.$rest('questionnaires/' + this.qid)
                .get({
                    bind_id: this.bind_id,
                    bind_table: this.bind_table
                })
                .success(res => {
                    this.info = res
                })
                .error(res => {
                    this.error(res.body.message||'获取数据失败~')
                })
            }
		}
	}
</script>

<style>
    .info-poptip .ivu-poptip-popper{
        max-width: 400px;
    }
</style>

<style lang="less" scoped>
    .modal-table tbody tr:nth-child(2n), .table-list tbody tr:nth-child(2n){
        background-color: white;
    }

    .modal-table tr td, .table-list tr td{
        border: none;
    }

    .infoNums{
        color: red;
        font-weight: bold;
        cursor: pointer;
    }

    .info-tag{
        float: left;
    }
</style>