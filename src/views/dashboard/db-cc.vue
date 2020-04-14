<style lang="less">
    .data_card {
        height: 190px;
        border-radius: 1px;
        box-shadow: 2px 2px 2px #EEE;
        position: relative;
        background-color: white;
        text-align: center;
    }

    .qk_nav {
        height: 100px;
        text-align: left;
        padding-left: 75px;
    }

    .data_card_title {
        position: absolute;
        top: 10px;
        left: 20px;
        font-size: 13px;
        font-weight: 700;
        color: #525252;
    }

    .data_card_num {
        font-size: 50px;
        line-height: 190px;
    }

    .fast_wrap {
        width: 100%;
        padding-top: 13px;
    }

    .fast_box {
        display: inline-block;
        height: 80px;
        color: #657180;
        text-align: center;
        margin-right: 100px;
    }

    .fast_box:hover img{
        transform: scale(0.9,0.9);
    }

    .fast_box img{
        width: 50px;
        height: 50px;
        margin-bottom: 5px;
        transition: all 0.2s;
    }

    .data_card_head {
        width: 100%;
        height: 40px;
        text-align: left;
    }

    .data_card_head span{
        font-size: 14px;
        color: #657180;
        line-height: 40px;
        margin-left: 20px;
    }

    .data_list {
        width: 88%;
        margin: 0 auto;
        color: #657180;
    }

    .data_list tr {
        height: 45px;
        line-height: 45px;
        font-size: 13px;
        border-bottom: 1px solid #E6E4E4;
    }

    .rank_card {
        height: 400px;
        border-radius: 1px;
        box-shadow: 2px 2px 2px #EEE;
        position: relative;
        background-color: white;
        text-align: center;
    }
    .time_range {
        position: absolute;
        top: 20px;
        right: 30px;
    }
    .card_shadow {
        border-radius: 1px;
        box-shadow: 2px 2px 2px #EEE;
    }
</style>
<template>
    <div>
        <Row :gutter="20" style="margin-bottom: 20px;">
            <div class="data_card qk_nav">
                <div class="fast_wrap">
                    <a class="fast_box" href="javascript:void(0)" @click="openModal1">
                        <img src='http://sp1.xiao360.com/static/ui/pc/t/default/register-fast.png'><br>
                        咨询登记
                    </a>
                    <a class="fast_box" href="javascript:void(0)" @click="openModal2">
                        <img src='http://sp1.xiao360.com/static/ui/pc/t/default/visit-fast.png'><br>
                        客户跟进
                    </a>
                </div>
            </div>
        </Row>
		<Row :gutter="20">
            <Col span="8">
                <div class="data_card">
                    <span class="data_card_title">今日沟通数</span>
                    <span class="data_card_num" style="color:#3399FF">{{today_follow_up}}</span>
                </div>
            </Col>
            <Col span="8">
                <div class="data_card">
                    <span class="data_card_title">今日试听数</span>
                    <span class="data_card_num" style="color:#FCA727">{{today_trial_listen}}</span>
                </div>
            </Col>
            <Col span="8">
                <div class="data_card">
                    <span class="data_card_title">今日上门数</span>
                    <span class="data_card_num" style="color:#00CCBB">{{today_promise}}</span>
                </div>
            </Col>
        </Row>
        <Row :gutter="20" style="margin-top: 20px;">
            <Col span="8">
                <recent-card :recent_data="recent_contact" :title="'最近沟通'" class="card_shadow"/>
            </Col>
            <Col span="8">
                <recent-card :recent_data="trial_listen" :title="'最近试听'" class="card_shadow"/>
            </Col>
            <Col span="8">
                <recent-card :recent_data="recent_assigned" :title="'最近分配'" class="card_shadow"/>
                <!-- <div class="data_card">
                    <div class="data_card_head" style="background-color: #FFEDD3;">
                        <span>最近分配</span>
                    </div>
                    <table class="data_list">
                        <tr v-for="(item,index) in recent_assigned" :key="index">
                            <td style="text-align: left">{{item.employee.ename}}</td>
                            <td><rich-tel :row="item"/></td>
                            <td style="text-align: right,width:100px">{{item.create_time.split(' ')[0]}}</td>
                        </tr>
                    </table>
                </div> -->
            </Col>
        </Row>
        <Row style="margin-top: 20px;">
            <Col span="24">
                <div class="rank_card">
                    <span class="data_card_title" style="top:15px;">客户转换业绩排名</span>
                    <RadioGroup v-model="area_range" type="button" size="small" style="margin: 20px" @on-change="initCc">
                        <Radio label="校区"></Radio>
                        <Radio label="机构"></Radio>
                    </RadioGroup>
                    <RadioGroup class="time_range" v-model="time_range" type="button" size="small" @on-change="initCc">
                        <Radio label="本周"></Radio>
                        <Radio label="本月"></Radio>
                        <Radio label="本年"></Radio>
                    </RadioGroup>
                    <div style="width: 98%;margin-left:20px">
                        <ve-histogram
                            height="370px"
                            :data="rankData" 
                            :data-empty="rankData.rows.length==0"  
                            :settings="rankChartSettings" 
                            :extend="extend">
                        </ve-histogram>
                    </div>
                </div>
            </Col>
        </Row>
      
    </div>
</template>
<script>
    import vue from 'vue'
    import $rest from '@/libs/rest'
    import common from '@/libs/common.mixin'
    import globals from '@/libs/globals.mixin'
    import BroadCast from './home/broad-cast'
    import StudentLessonWarn from './home/student-lesson-warn'
    import ClassTimesWarn from './home/class-times-warn'
    import StudentLostWarn from './home/student-lost-warn'
    import TodoList from './home/todo-list'
    import TodayTrial from './home/today-trial'
    import BirthdayRemind from './home/birthday-remind'
    import StudentStats from './home/student-stats.vue'
    import RecentCard from './cc/recent-card.vue'
    import CountUp from 'c%/CountUp.vue'
    import RichTel from 'c%/RichTel.vue'
    import VeHistogram from 'v-charts/lib/histogram.common'
   
  
    export default {
        name: 'Home',
        mixins: [common,globals],
        components: {
            BroadCast,
            StudentLessonWarn,
            ClassTimesWarn,
            StudentLostWarn,
            TodoList,
            TodayTrial,
            BirthdayRemind,
            StudentStats,
            CountUp,
            VeHistogram,
            RichTel,
            RecentCard
        },
        data() {
            this.rankChartSettings = {
				labelMap: {
					day: '日期',
					num: '金额'
				}
            }
            this.extend = {
                legend: {
                    data: []
                },
				series: {
                    barWidth: '20%',
                    itemStyle:{
                        normal:{
                            color:'#3399FF'
                        }
                    }
				},
				yAxis: {
					splitLine: {
						lineStyle: {
							color: ['#eee']
						}
					}
				}
			}
            return {
                area_range: '校区',
                time_range: '本周',
                rankData: {
					columns: ['rank','num'],
					rows: []
                },
                today_follow_up: 0,
                today_trial_listen: 0,
                today_promise: 0,
                recent_contact: [],
                recent_assigned: [],
                trial_listen: []
            }
        },
        mounted(){
            this.initCc();
        },
        methods: {
            initCc() {
                //初始化业绩排行数据
                var typeStr = 'week';
                switch(this.time_range) {
                    case '本周':
                        typeStr = 'week';
                        break;
                    case '本月':
                        typeStr = 'month';
                        break;
                    case '本年':
                        typeStr = 'year';
                        break;
                }
                this.$http.get('dashboard/cc',{
                    params: {
                        type: typeStr,
                        bid: this.area_range == '校区'?this.bid$:0
                    }
                })
                .then(function(response) {
                    // console.log(response)
                    var data = response.body.data;
                    var list = data.list;
                    var rankData = [];
                    // var indexMap = ['一','二','三','四','五','六','七','八','九','十'];
                    for(let i in list) {
                        let row = {
                            // rank: '第' + indexMap[i] + '名',
                            rank: list[i].name,
                            num: list[i].total
                        };
                        rankData.push(row);
                    }
                    this.rankData.rows = rankData;
                    this.today_follow_up = data.today_follow_up;
                    this.today_promise = data.today_promise;
                    this.today_trial_listen = data.today_trial_listen;
                    this.recent_contact = data.recent_contact;
                    this.recent_assigned = data.recent_assigned;
                    this.trial_listen = data.trial_listen;
                })
            },
            openModal1() {
                this.$Modal.open('recruiting/recruiting-info-modal.vue')
                .then(modal=>{
                    modal.show('咨询登记','add')
                })
            },
            openModal2() {
                this.$Modal.open('recruiting/following/follow-info-modal.vue')
                .then(modal=>{
                    modal.show('客户跟进','add')
                })
            },
            quick_nav_click(item){
                let uri = item.uri
                if(this.quick_nav_class(item)['foggy-light']) return ; 
                if(uri.indexOf('.vue') !== -1){
                    this.$Modal.open(uri)
                    .then(modal=>{
                        modal.vuec.show(item.text,'add')
                    })
                }else if(uri.indexOf('http://') !== -1 || uri.indexOf('https://') !== -1){
                    window.open(uri)
                }else{
                    this.$router.push({path: uri})
                }
            },
            quick_nav_class(item){
               let cls = {}
               if(this.pers.indexOf('dashboard.'+item.name) === -1 && item.is_system == 1){
                    cls['foggy-light'] = true
               }
               return cls
            },
            hasPer(v) {
                return this.pers.indexOf('dashboard.' + v) > -1
            },
            setCurrentRid() {
                for(let i=0,len=this.rids.length;i<len;i++) {
                    let role = this.quick_navs.find(nav => nav.rid == this.rids[i])
                    if(role) {
                        this.current_rid = this.rids[i]
                        break;
                    }
                }
            }
        },
        computed: {
            pers() {
                return this.$store.state.user.info.pers
            },
            quick_navs(){
                let default_navs = this.$store.state.gvars.quick_navs
                let theme = this.theme.split('-')[1]
                const pre_url = 'http://sp1.xiao360.com/static/ui/pc/t/'
                default_navs.forEach(nav => {
                    nav.items.forEach(item => {
                        let iconSplit = item.icon.split('/')
                        let png = iconSplit[iconSplit.length - 1]
                        item.icon = pre_url + theme + '/' + png
                    })
                })
                return default_navs
            },
            rids() {
                return this.$store.state.user.info.employee.rids
            },
            isCc() {
                return (this.rids_user.indexOf(7) == -1)?false:true;
                // return true
            }

        }
    }
</script>