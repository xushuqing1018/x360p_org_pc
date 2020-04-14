<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="1200">
        <div>
            <Tabs>
                <TabPane :label="init_label('学习笔记',info.study_note_nums)">
                    <study-note :ats_id="item.ats_id"></study-note>
                </TabPane>
                <TabPane :label="init_label('调查问卷',info.questionnaire_nums)">
                    <questionnaire-info v-if="info.questionnaire_nums > 0" :qid="info.questionnaire_bind.qid" :bind_id="item.ats_id" bind_table="appointment_student"></questionnaire-info>
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
    
    import QuestionnaireInfo from '../event/summary/questionnaire-info.vue'
    import StudyNote from './summary/study-note.vue'

	export default {
        mixins: [common,modal,globals],
        props:{
            item:{
                type:Object,
                default:{}
            }
        },
        components:{
            QuestionnaireInfo,
            StudyNote
        },
		data() {
			return {
                info:{
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
                this.$rest('appointment_subjects/get_summary')
                .get({
                    ats_id: this.item.ats_id
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