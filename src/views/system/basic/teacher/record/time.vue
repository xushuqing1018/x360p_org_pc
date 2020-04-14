<template>
    <div style="margin-top:5px;">
        <table class="table table-border table-week m-t">
            <thead>
                <tr>
                    <th><div class="header-week-day">周一</div></th>
                    <th><div class="header-week-day">周二</div></th>
                    <th><div class="header-week-day">周三</div></th>
                    <th><div class="header-week-day">周四</div></th>
                    <th><div class="header-week-day">周五</div></th>
                    <th><div class="header-week-day">周六</div></th>
                    <th><div class="header-week-day">周日</div></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td v-for="(array,key) in timeList">
                        <ul class="time-section" v-if="array.length>0">
                            <li v-for="(item,index) in array"><span class="index">{{index}}</span> <span class="section">{{item.start}}~{{item.end}}</span></li>
                        </ul>
                        <p class="empty" v-else>未设置时间段</p>
                    </td>
                </tr>
                <tr class="footer">
                    <td><Button @click="edit_week_times(1)" size="small" type="primary" long><Icon type="ios-compose-outline"></Icon>设置</Button></td>
                    <td><Button @click="edit_week_times(2)" size="small" type="primary" long><Icon type="ios-compose-outline"></Icon>设置</Button></td>
                    <td><Button @click="edit_week_times(3)" size="small" type="primary" long><Icon type="ios-compose-outline"></Icon>设置</Button></td>
                    <td><Button @click="edit_week_times(4)" size="small" type="primary" long><Icon type="ios-compose-outline"></Icon>设置</Button></td>
                    <td><Button @click="edit_week_times(5)" size="small" type="primary" long><Icon type="ios-compose-outline"></Icon>设置</Button></td>
                    <td><Button @click="edit_week_times(6)" size="small" type="primary" long><Icon type="ios-compose-outline"></Icon>设置</Button></td>
                    <td><Button @click="edit_week_times(7)" size="small" type="primary" long><Icon type="ios-compose-outline"></Icon>设置</Button></td>							
                </tr>
            </tbody>
            
        </table>
        <time-modal ref="ref_edit" @on-ok="onOk"></time-modal>
    </div>
</template>

<script>
import TimeModal from './time-modal.vue'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import util from '@/libs/util'

export default {
    components: { TimeModal },
    mixins: [common,globals],
    props: {
        eid: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            timeList: {}
        }
    },
    watch: {
        eid() {
            this.initData();
        }
    },
    mounted() {
        this.initData();
    },
    methods: {
        initData() {
            this.$http.get('employee_time_sections',{
                params: {
                    eid: this.eid
                }
            })
            .then(res => {
                var list = res.body.data.list;
                var array = {};
                for (let index = 1; index <= 7; index++) {
                    array[index] = [];
                }
                list.forEach((item,index) => {
                    var obj = {};
                    obj.start = item.int_start_hour;
                    obj.end = item.int_end_hour;
                    array[item.week_day].push(obj);
                })
                this.timeList = array;
            })
        },
        edit_week_times(day) {
            this.$r('ref_edit')
            .set('week_day',day)
            .set('eid',this.eid)
            .show('设置'+this.week_name(day)+'时段')
        },
        week_name(week_day){
            let t = [ '一', '二', '三', '四', '五', '六','日'];
            return '周'+t[week_day - 1]
        },
        onOk() {
            this.initData();
        }
    }
}
</script>

<style lang='less'>
@import '~@/style/mixin.less';
.table{
	.header-split{
		width:80px;
		position:relative;
		text-align:center;
		overflow:hidden;
		> span{
			position:absolute;
			font-size:10px;
			font-weight:normal;
			&.right{
				top:0;
				right:5px;
			}
			&.left{
				left:5px;
				bottom:0;
			}
			&.line{
				border:1px solid #f2f2f2;
				width:140px;
				height:0;
				left:-30px;
				top:50%;
				.rotation(35deg);
			}
		}
	}
}
.table-week{
	thead > tr > th{
		border:1px solid #f2f2f2;
		text-align:center;
		width:14.285%;
		background:#EAF4FE;
	}
	tbody > tr > td{
		border:1px solid #f2f2f2;
		padding:5px 2px;
	}
	tbody > tr.footer > td{
		background:#f2f2f2;
	}
	.time-section{
		&:empty{
			content:'没有设置时间段'
		}
	}
}
.time-section{
	>li{
		list-style: none;
		line-height:30px;
		border-bottom:1px dotted #f2f2f2;
		color:#666;

		>span.index{
			display:inline-block;
			background:#2D8CF0;
			text-align:center;
			font-size:9px;
			color:#fff;
			width:16px;
			height:16px;
			vertical-align:middle;
			line-height:16px;
			border-radius:8px;
		}
		>span.section{
			display:inline-block;
			line-height:16px;
			vertical-align:middle;
		}
		>a.btn-copy{
			display:inline-block;
			height:16px;
			line-height:16px;
			vertical-align:middle;
			color:#666;
			padding-left:3px;
			&:hover{
				color:#000;
			}
		}
	}
}
.empty{
	color:#ccc;
}
.v-narrow{
	p{margin:0;}
}
.side-branch{
	margin:5px 10px;
	border:1px solid #EBEBEB;
	.branch-list{
      margin-top:10px;
      margin-bottom:10px;
      p.empty{color:#999;}
      max-height:400px;
      overflow-y:auto;
      .item{
        >a{
          display:block;
          line-height:26px;
          padding-left:10px;
          padding-right:10px;
          display:block;
          .ivu-icon{
            float:right;
            margin-top:5px;
          }
          
          &:hover{
            background:#eee;
          }
          &.selected{
            background:#2D8CF0;
            color:#fff;
          }
        }
      }
    }
}
.lesson-date{
	margin-bottom:15px;
	position:relative;
	padding-left:100px;
	label{
		position:absolute;
		left:20px;
		top:5px;
	}
	button{
		position:absolute;
		top:0;
		left:305px;
	}

}

.time-list {
    font-size: 12px !important;
}

.time-checkbox {
    margin-right: 40px;
}
</style>
