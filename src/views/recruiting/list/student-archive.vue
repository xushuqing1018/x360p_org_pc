<template>
    <div class="archive-bg">
        <div v-if="!isStudent">该客户还不是正式学员</div>
        <Row v-else :gutter="16">
            <Col span="12">
                <div class="archive-card">
                    <div class="archive-item-head">
                        <Icon type="ios-information" :size="20"></Icon>
                        <span class="archive-item-title">基本信息</span>
                    </div>
                    <div class="archive-item-content">
                        <table class="student-info">
                            <tr>
                                <td>校区：</td>
                                <td>{{data.bid|branch_name}}</td>
                                <td>学校：</td>
                                <td>{{data.school_id_text||'未设置'}}</td>
                                <td>学号：</td>
                                <td>{{data.sno||'未设置'}}</td>
                            </tr>
                            <tr>
                                <td>年级：</td>
                                <td>{{school_grade}}</td>
                                <td>班级：</td>
                                <td>{{data.school_class||'未设置'}}</td>
                                <td>卡号：</td>
                                <td>{{data.card_no||'未绑定'}}</td>
                            </tr>
                            <tr>
                                <td>账户余额：</td>
                                <td><Tag color="red">{{label_currency}}{{data.money}}</Tag></td>
                                <td>学习/消费积分：</td>
                                <td>
                                    <Tag color="blue">{{data.credit}}</Tag>
									<Tag color="blue">{{data.credit2}}</Tag>
                                </td>
                                <td v-if="data.status == 30">休学原因：</td>
                                <td v-if="data.status == 30">{{data.stop_reason||'-'}}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </Col>
            <Col span="12">
                <div class="archive-card">
                    <div class="archive-item-head">
                        <Icon type="android-time" :size="19"></Icon>
                        <span class="archive-item-title">课时情况</span>
                        <!-- <a class="archive-item-more" @click.prevent="goto_student_lesson">查看更多</a> -->
                    </div>
                    <div class="archive-item-content">
                        <student-lesson :sid="sid"></student-lesson>
                    </div>
                </div>
            </Col>
        </Row>
    </div>
</template>

<script>

import moment 		  	from 'moment'	
import util,{_} 		from '@/libs/util'
import common 		  	from '@/libs/common.mixin'
import globals 		  	from '@/libs/globals.mixin'
import StudentLesson    from './student-archive/student-lesson.vue'

export default {
    mixins: [globals,common],
    components: {
        StudentLesson
    },
    props:{
	    cuId: {
	    	type:[Number,String],
	    	default: ()=> {
	    		return 0
	    	}
	    }     
    },
    data() {
        return {
            data: {},
            isStudent: false,
            sid: 0,
            lesson_data: {},
            pageSize: 4
        }
    },
    mounted() {
        let id = this.cuId == 0 ? this.$route.params.id : this.cuId
        this.$http.get('customers/'+id)
        .then(res => {
            this.data = res.body.data.customer;
            if(this.data.sid != 0) {
                this.sid = this.data.sid;
                this.isStudent = true;
                return Promise.resolve();
            }
            else {
                return Promise.reject();
            }
        })
        .then(() => {
            this.getStudentArchive();
        })
    },
    methods: {
        getStudentArchive() {
            this.$http.get('students/'+this.sid)
            .then(res => {
                this.data = res.body.data;
            })
        },
        // getStudentLesson() {
        //     this.$http.get('student_lessons?page=1&pagesize=4&with=one_class&sid='+this.sid)
        //     .then(res => {
        //         this.lesson_data = res.body.data.list;
        //         this.lesson_data = res.body.data.list;
        //     })
        // },
        // goto_student_lesson() {
        //     this.$router.push({path: 'business/student/'+ this.sid +'/lesson'});
        // }
    },
    computed: {
        school_grade() {
            return this.data.school_grade == 0 ? '未设置' : this.$filter('dict_title')(this.data.school_grade,'grade')
        }
    }
}
</script>

<style scoped>
.archive-bg {
    padding: 20px;
    background-color: white;
}

.archive-item-head {
    font-size: 15px;
    color: #3399FF;
    padding: 5px 0px;
    border-bottom: 1px dashed rgb(163, 209, 255);
    margin-bottom: 10px;
    font-weight: bold;
}

.archive-item-title {
    vertical-align: top;
}

.student-info {
    width: 100%;
    font-size: 13px;
    border-collapse: separate;
    border-spacing: 0px 15px;
}

.student-info td:nth-child(odd) {
    text-align: right;
    width: 13%;
    font-weight: bold;
}

.student-info td:nth-child(even) {
    text-align: left;
    width: 20%;
}

.archive-item-more {
    float: right;
    font-size: 13px;
    font-weight: normal;
}
</style>
