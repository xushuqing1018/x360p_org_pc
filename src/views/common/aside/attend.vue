<template>
	<div :class="[attend,!per_attendance?'foggy':'']">
		<div class="aside-options">
	      <div class="attend-circle mt-4">
	        <i-circle
	            :size="120"
	            :trail-width="4"
	            :stroke-width="5"
	            :percent="Number(attendance_rate)"
	            stroke-linecap="square"
	            stroke-color="#38C4FF">
	            <div class="demo-Circle-custom">
	                <h1>{{attendance_rate}}%</h1>
	                <p>出勤率</p>
	                <span>
	                    请假人次
	                    <i>{{attendance.student_leave_num}}</i>
	                </span>
	            </div>
	        </i-circle>
					<Icon v-if="attendance.no_attendance_num!=0" type="information-circled" class="no-attend-btn" color="#ed3f14" :title="'今日未考勤：'+attendance.no_attendance_num" @click="no_attend"></Icon>
	      </div>
	    </div>
	    <div class="aside-options">
	      <div class="attend-table mt-4">
	        <table>
	          <thead>
	            <tr>
	              <th>排班</th>
	              <th>排课</th>
	              <th>考勤人数</th>
	            </tr>
	          </thead>
	          <tbody>
	            <tr>
	              <td><i>{{attendance.class_num}}</i>总排班</td>
	              <td><i>{{attendance.course_num}}</i>总排课</td>
	              <td><i>{{attendance.student_num}}</i>总人次</td>
	            </tr>
	            <tr>
	              <td><i>{{attendance.class_attendance_num}}</i>已考勤</td>
	              <td><i>{{attendance.course_attendance_num}}</i>已考勤</td>
	              <td><i>{{attendance.student_attendance_num}}</i>已考勤</td>
	            </tr>
	          </tbody>
	        </table>
	      </div>
	    </div>
	    <div class="separate"></div>
	    <div class="aside-options">
	      <div class="new-attend">
	        <div class="title">
	          <span>最近考勤</span>
	          <div class="more" @click="lookMore">查看更多&nbsp;<Icon type="chevron-right"></Icon></div>
	        </div>
	        <div class="content">
	          <table>
	            <tbody>
	            	<transition 
	            		name="custom-classes-transition"
					    enter-active-class="animated bounceInRight"
						leave-active-class="animated fadeOutUp">
		              <tr v-if="!currentAttend">
		                <td>
		                  <letter-avatar
		                      title=""
		                      size='50' 
		                      :src="attendStu.student.photo_url" 
		                      :name='attendStu.student.student_name' 
		                      :rounded='true'>
		                  </letter-avatar>
		                </td>
		                <td style="padding-left:5px;padding-bottom:5px;">
		                  <p>{{attendStu.student.student_name}}·{{attendStu.class_name}}</p>
		                  <p>{{attendStu.student.last_attendance_time}}</p>
		                </td>
		              </tr>
		          </transition>
		          <tr v-if="currentAttend && isEmpty">
	              	<td colspan="2" class="empty">暂无考勤学员</td>
	              </tr>
	            </tbody>
	          </table>
	        </div>
	      </div>
	    </div>
	    <div class="separate"></div>
	    <div class="aside-options">
	      <div class="lesson-today">
	        <div class="title">
	          <span>今日课表</span>
	          <span class="more" @click="attend">去考勤</span>
	        </div>
	        <div class="content" :style="{height: contentHeight+'px',overflow: 'auto'}">
	          <div class="lesson_item" v-for="item in todayCourse">
	            <table :class="checkTime(item)" width='100%'>
	              <tbody>
	                <tr>
	                  <td>
	                  	<span v-if="item.lid>0">{{item.lid|lesson_name}}</span>
	                  	<span v-else>{{item.sj_id|subject_name}}</span>
	                  </td>
	                  <td class="text-right">{{item.cr_id|classroom_name('未知')}}</td>
	                </tr>
	                <tr>
	                  <td>
	                  	{{getClassName(item)}}
						<Tag color="green" v-if="item.name">试</Tag>
	                  </td>
	                  <td class="text-right">{{item.int_start_hour|int_hour}}—{{item.int_end_hour|int_hour}}</td>
	                </tr>
	              </tbody>
	            </table>
	          </div>
	          <span class="text-center empty" v-if="todayCourse.length == 0">暂无课表</span>
	        </div>
	      </div>
	    </div>
	</div>
</template>
<script>
	import Vue from 'vue'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import letterAvatar from 'c%/LetterAvatar.vue'
	import util,{_} from '@/libs/util'
	export default {
		name: 'Attend',
		mixins: [common,globals,grid],
		components: {letterAvatar},
		data() {
		    return {
		    	rest_api: 'dashboard/today_course',
		    	isEmpty: true,
		        attendStu: {},		// 最近考勤学员
		        attendance: {},		// 考勤数据
		        todayCourse: [],    // 今日课表
		    }
		},
		created() {
			let attendStu = JSON.parse(Vue.localStorage.get('__attendance__'))
			if(typeof attendStu !== undefined) {
				this.attendStu = attendStu
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			no_attend() {
				this.$Modal.open('business/attendance/attendance-list.vue@modal',{
					autoShow:false,
					on: {
						'on-success': ()=>{
							this.init_data()
						}
					},
					props: {
						noAttend: true
					}
				})
				.then(modal=>{
						modal.vuec.set('mode','list')
						.show('按排课登记考勤','add')
				})
			},
			deal_data(data) {
				this.attendance  = data.attendance
				this.todayCourse = data.course
				return data
			},
		    checkTime(item) {
		        let start = parseInt(item.int_start_hour)
		        let end   = parseInt(item.int_end_hour)
		        let now   = parseInt(this.now_time)
		        if(start < now && now< end) {
		          return 'highlight-color'
		        }else if(now > end) {
		          return 'dark-color'
		        }
		    },
		    lookMore() {
		    	if(this.per_attendance) {
		    		this.$router.push({path: '/business/attendance/student'})
		    	}
		    },
		    attend() {
		    	this.$Modal.open('business/attendance/attendance-list.vue@modal',{autoShow:false})
                .then(modal=>{
                    modal.vuec.set('mode','view')
                    .show('按排课登记考勤','add')
                })
		    },
		    getClassName(item) {
		    	if(item.one_class!=undefined) {
		    		return item.one_class.class_name
		    	}else if(item.lesson_type !== 0) {
		    		return this.$filter('lesson_type')(item.lesson_type)
		    	}else if(item.name) {
		    		return item.name
		    	}
		    }
		},
		computed: {
		    now_time() {
		        return moment(new Date()).format('HHmm')
		    },
		    currentAttend() {
		    	return _.isEmpty(this.attendStu)
		    },
		    attendance_rate() {
		    	if(this.attendance.student_num == 0) {
		    		return '0'
		    	}else{
		    		return (this.attendance.student_attendance_num/this.attendance.student_num*100).toFixed(1)
		    	}
		    },
		    pers() {
                return this.$store.state.user.info.pers
            },
		    per_attendance() {
                return this.pers.indexOf('dashboard.side_attendance_panel') > -1 ? true : false
            },
            contentHeight() {
            	let client_height = util.get_client_height()
				return client_height - 565 - 50
            }
		},
		watch: {
			'bid$': {
				handler: function() {
					this.init_data()
				}
			}
		}
	}
</script>
<style lang="less">
  .demo-Circle-custom{
      & h1{
          color: #3f414d;
          font-size: 25px;
          font-weight: normal;
      }
      & p{
          color: #657180;
          font-size: 12px;
          margin: 5px;
      }
      & span{
          display: block;
          padding-top: 8px;
          color: #657180;
          font-size: 12px;
          &:before{
              content: '';
              display: block;
              width: 50px;
              height: 1px;
              margin: 0 auto;
              background: #e0e3e6;
              position: relative;
              top: -8px;
          };
      }
      & span i{
          font-style: normal;
          color: #3f414d;
      }
  }
  .attend-circle {
		text-align: center;
		position: relative;
  }
  .attend-table {
    table {
      width: 100%;
      th,td {
        font-size: 10px;
        font-weight: normal;
        text-align: center;
        padding: 8px;
      }
      thead {
        background-color: #D3EAFD;
        color: #356fbe;
        th {
          border-bottom: 1px solid #cfd8dc !important;
        }
      }
      tbody {
        tr {
          color: #666;
          border-bottom: 1px solid #f3f3f3;
          i {
            display: block;
            font-weight: bold;
            font-style: normal;
            color: #3f414d;
          }
        }
      }
      tr td:nth-child(2),th:nth-child(2) {
        border-left: 1px solid #f3f3f3;
        border-right: 1px solid #f3f3f3;
      }
    }
  }
  .separate {
    height: 8px;
    background-color: #F3F3F3;
  }
  .new-attend, .lesson-today {
    padding: 10px 10px 10px 15px;
    .title {
      font-weight: bold;
      color: #4B4B4B;
      .more {
        display: inline-block;
        font-size: 12px;
        float: right;
        color: #38C4FF;
        cursor: pointer;
      }
    }
    .content {
      margin-top: 10px;
      color: #495060;
      &::-webkit-scrollbar {
      	display: none;
      }
    }
  }
  .lesson-today {
    .lesson_item {
      padding-top: 5px;
      padding-bottom: 5px;
      border-bottom: 1px solid #eee;
      table {
        td {
          padding: 2px;
        }
      }
      .highlight-color {
        color: #38C4FF;
      }
      .dark-color {
        color: #c3cbd6;
      }
    }
	}
	.no-attend-btn {
		position: absolute;
		bottom: -10px;
		right: 20px;
		cursor: pointer;
		font-size: 14px;
	}
</style>