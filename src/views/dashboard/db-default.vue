<style lang="less">
    .home-role-group {
        display: inline-block;
        vertical-align: middle;
        font-size: 0;
        .role-item {
            background: #fff;
            cursor: pointer;
            height: 24px;
            line-height: 22px;
            font-size: 12px;
            padding: 0 12px;
            margin: 0;
            transition: all .2s ease-in-out;
            vertical-align: middle;
            white-space: nowrap;
            border-bottom: 1px solid #eff4f8;
            border-left: 1px solid #eff4f8; 
            &:first-child {
                border-radius: 3px 0 0 0;
            }
            &:last-child {
                border-radius: 0 3px 0 0;
            }
            &.active {
                color: #39f;
            }
        }
    }
    
</style>
<template>
    <div>
		<div class="home-role-group" :class="{'m-t-20':!is_sdb_open}" v-if="quick_navs.length>1">
			<label 
				:class="['role-item',current_rid==item.rid?'active':'']" 
				v-for="(item,index) in quick_navs"
                :key="index"
				@click="current_rid=item.rid">
				<span>{{item.rid|role_name('默认')}}</span>
			</label>
		</div>
		<div
			class="app-header-nav" 
            :class="{'m-t-20':!is_sdb_open&&quick_navs.length==1}"
			v-intro="header_intro" 
			v-intro-step="5"
			v-for="(nav,index2) in quick_navs"
            :key="index2"
			v-if="nav.rid==current_rid"> 
			<div :class="['fast-box',{'ten-box':nav.items.length>10}]" 
                v-for="(item,index3) in nav.items" 
                :key="index3"
                v-if="hasPer(item.name)||item.is_system == 0"
                >
				<img :src="item.is_system==1?item.theme_icon:item.icon" @click="quick_nav_click(item)" width="50px" height="50px" />
				<div>{{item.text}}</div>
			</div>
		</div>
		<div class="row m-t-20" v-intro="broad_intro" v-intro-step="6">
			<div class="col-md-12">
				<div class="panel" :class="{'foggy':!hasPer('broadcast')}">
					<broad-cast :visible="hasPer('broadcast')"></broad-cast>
				</div>
			</div>
		</div>
		<div class="row m-t-20" v-intro="warn_intro" v-intro-step="7">
			<div class="col-md-4 col-sm-12">
				<div class="panel" :class="{'foggy':!hasPer('lessonwarn')}">
					<student-lesson-warn :visible="hasPer('lessonwarn')"></student-lesson-warn>
				</div>
			</div>
			<div class="col-md-4 col-sm-12 warn-middle">
				<div class="panel" :class="{'foggy':!hasPer('timeswarn')}">
					<class-times-warn :visible="hasPer('timeswarn')"></class-times-warn>
				</div>
			</div>
			<div class="col-md-4 col-sm-12">
				<div class="panel" :class="{'foggy':!hasPer('lostwarn')}">
					<student-lost-warn :visible="hasPer('lostwarn')"></student-lost-warn>
				</div>
			</div>
		</div>
		<div class="panel row m-t-20 mx-0" v-intro="remind_intro" v-intro-step="8">
			<div class="col-md-4 col-sm-12 remind-left">
				<div :class="{'foggy':!hasPer('backlogs')}">
					<todo-list :visible="hasPer('backlogs')"></todo-list>
				</div>
			</div>
			<div class="col-md-4 col-sm-12 remind-middle">
				<div :class="{'foggy':!hasPer('todaytrial')}">
					<today-trial :visible="hasPer('todaytrial')"></today-trial>
				</div>
			</div>
			<div class="col-md-4 col-sm-12 remind-right">
				<div :class="{'foggy':!hasPer('birthday')}">
					<birthday-remind :visible="hasPer('birthday')"></birthday-remind>
				</div>
			</div>
		</div>
		<div class="row m-t-20" v-intro="stats_intro" v-intro-step="9">
			<div class="col-sm-12">
				<div class="panel" :class="{'foggy':!hasPer('studentstats')}">
					<student-stats :visible="hasPer('studentstats')"></student-stats>
				</div>
			</div>
		</div>
      
    </div>
</template>
<script>
    import util from '@/libs/util'
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
    import CountUp from 'c%/CountUp.vue'
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
            VeHistogram
        },
        data() {
            this.header_intro = '这块区域是工作台的快捷功能入口区，前台常用的功能不需要在左边菜单进入，可以在这里直接点击进入。'
            this.broad_intro = '这块区域是公告栏,点击公告栏标题可以查看公告详细，拥有公告权限的登录用户可以直接在右边点击“+”号进行公告发布。'
            this.warn_intro = '这一横排区域展示的是预警信息，包括三种类型的预警：课次预警、排课预警、流失预警。'
            this.remind_intro = '这一横排区域是提醒信息，包括三种类型的提醒：待办提醒、试听提醒、生日提醒。'
            this.stats_intro = '这一横排区域是统计信息，可概要查看近一周学员的报名情况、出勤情况、课消情况'
            this.rankChartSettings = {
				labelMap: {
					day: '日期',
					num: '客户数'
				}
            }
            this.extend = {
                legend: {
                    data: []
                },
				series: {
                    barWidth: '5%',
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
               current_rid: 0,
            }
        },
        mounted(){
            // this.setCurrentRid()
            this.$store.dispatch('updateRouterHelp',this.$route.path)
        },
        methods: {
            quick_nav_click(item){
                let uri = item.uri
                if(this.quick_nav_class(item)['foggy-light']) return ; 
				
				if(this.org_type == 2){
					if(uri.indexOf('recruiting/market/') === -1){
						this.error('功能受限，请联系校区督导开通。')
						return;
					}
				}
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
                let default_navs = util.copy(this.$store.state.gvars.quick_navs)
                let theme = this.theme.split('-')[1]
                const pre_url = 'http://sp1.xiao360.com/static/ui/pc/t/'
                default_navs.forEach(nav => {
                    nav.items.forEach(item => {
                        if(item.icon.indexOf('static/ui/pc/t/') !== -1){
                            let iconSplit = item.icon.split('/')
                            let png = iconSplit[iconSplit.length - 1]
                            item.theme_icon = pre_url + theme + '/' + png
                        }else{
                            item.theme_icon = item.icon
                        }
                    })
                })
                return default_navs
            },
            rids() {
                return this.$store.state.user.info.employee.rids
            }
        }
    }
</script>