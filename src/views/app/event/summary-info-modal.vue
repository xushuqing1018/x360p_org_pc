<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="1200">
        <div v-if="info.event_type_did == 185">
            <Alert show-icon type="success">
                <Icon type="android-bookmark" slot="icon"></Icon>
                <div slot="desc">
				    <span>
                        主题交流人数：<span class="info-nums">{{info.thematic_exchange_nums}}</span>，
		    	    </span>
				    <span>
                        旁听人数：<span class="info-nums">{{info.observer_nums}}</span>
		    	    </span>
                </div>
		    </Alert>
        </div>
        <div>
            <Tabs>
                <TabPane :label="init_label('应到学员',info.apply_nums)">
                    <sign-student :item="item"></sign-student>
                </TabPane>
                <TabPane :label="init_label('已到学员',info.arrived_nums)">
                    <sign-student :item="item" :is_attend="1"></sign-student>
                </TabPane>
                <TabPane :label="init_label('未到学员',info.un_arrived_nums)">
                    <sign-student :item="item" :is_attend="0"></sign-student>
                </TabPane>
                <TabPane :label="init_label('迟到学员',info.arriv_late_nums)">
                    <sign-student v-if="info.event_start_time_str" :item="item" :is_attend="1" :attend_time="info.event_start_time_str"></sign-student>
                </TabPane>
                <TabPane :label="init_label('活动附件',info.event_attachment.length)">
                    <file-item v-if="info.event_attachment.length > 0" :list="info.event_attachment"></file-item>
                    <div v-else class="mescroll-empty">
                        <img src="https://sp1.xiao360.com/static/img/student/nodata.png" />
                        <p class="empty-tip">还没上传活动附件哦~</p>
                    </div>
                </TabPane>
                <TabPane :label="init_label('学习笔记',info.study_note_nums)">
                    <study-note :event_id="item.event_id"></study-note>
                </TabPane>
                <TabPane :label="init_label('调查问卷',info.questionnaire_nums)">
                    <questionnaire-info v-if="info.questionnaire_nums > 0" :qid="info.questionnaire_bind.qid" :bind_id="item.event_id" bind_table="event"></questionnaire-info>
                    <div v-else class="mescroll-empty">
                        <img src="https://sp1.xiao360.com/static/img/student/nodata.png" />
                        <p class="empty-tip">还没有学员填写调查问卷哦~</p>
                    </div>
                </TabPane>
            </Tabs>
        </div>
        <Spin size="large" fix v-if="spinShow"></Spin>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
    import util from '@/libs/util'
	import globals from '@/libs/globals.mixin'
	import modal from '@/libs/modal.mixin'
    import common from '@/libs/common.mixin'
    
    import SignStudent from './summary/sign-student.vue'
    import QuestionnaireInfo from './summary/questionnaire-info.vue'
    import StudyNote from './summary/study-note.vue'
    import FileItem from 'c%/FileItem.vue'

	export default {
        mixins: [common,modal,globals],
        props:{
            item:{
                type:Object,
                default:{}
            }
        },
        components:{
            SignStudent,
            FileItem,
            QuestionnaireInfo,
            StudyNote
        },
		data() {
			return {
                info:{
                    event_attachment:[],
                    questionnaire_bind:{
                        qid:0
                    }
                },
                spinShow:true
			}
        },
        computed:{
            init_label(){
                return function(text,nums){
                    return (h) => {
                        return h('div', [
                            h('span', text),
                            h('Badge', {
                                props: {
                                    count: nums
                                }
                            })
                        ])
                    }
                }
            }
        },
        mounted(){
            this.init_data()
        },
		methods: {
			init_data(){
                this.$rest('events/get_summary')
                .get({
                    event_id: this.item.event_id
                })
                .success(res => {
                    this.info = res
                    this.spinShow = false
                })
                .error(res => {
                    this.error(res.body.message||'获取数据失败~')
                    this.spinShow = false
                })
            }
		}
	}
</script>

<style lang="less" scoped>
    .info-nums{
        color: red;
        font-weight: bold;
    }
</style>