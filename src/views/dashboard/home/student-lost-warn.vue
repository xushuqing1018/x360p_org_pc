<template>
	<div class="warn-box stu-loss-warn">
		<div class="panel-header" style="background: #FDD3DB">
	        <div class="title">
	        	<span>流失预警</span>
	        	<Icon type="refresh" @click.native="init_data()"></Icon>
	        </div>
	        <div class="more cursor" @click="lookMore" v-show="visible">
	            共{{total}}条记录
	            <Icon type="chevron-right"></Icon>
	        </div>
	    </div>
	    <div class="panel-content">
	        <table>
	            <tbody>
	                <tr v-for="item in data">
	                    <td width="30%" class="notwrap">
	                    	<span>{{item.student_name}}</span>
	                    	<span v-if="item.ename">({{item.ename}})</span>
	                    </td>
	                    <td width="40%" class="text-center notwrap">
	                        <span class="info">日期</span> {{getLastAttendance(item)}}
	                    </td>
	                    <td width="30%" class="text-right notwrap">
	                        <span class="info">失联</span> {{item.lost_day}}天
	                    </td>
	                </tr>
	                <tr v-if="data.length == 0">
                        <td colspan="3" class="text-center nothing">
                            <Icon type="information-circled" class="mr-1"></Icon>暂无预警
                        </td>
                    </tr>
	            </tbody>
	        </table>
	        <p class="footer">
                <span>注：</span>
                <span class="info">日期</span>&nbsp;
                <span>最后一次考勤日期</span>&nbsp;
                <span class="info">失联</span>&nbsp;
                <span>无考勤、无沟通30天以上(含)</span>
            </p>
	    </div>
	    
	</div>
</template>

<script>
import moment from 'moment'
import grid from '@/libs/grid.mixin'
export default {
    name: 'StudentLostWarn',
    mixins: [grid],
    props: {
        visible: {
            type: Boolean,
            default: true
        }
    },
    data() {
  		return {
  			rest_api: 'dashboard/student_lost_warn'
  		}
    },
    mounted() {
  	    this.pageSize = 4
        this.init_data()
    },
    methods: {
    	lookMore() {
    		this.$Modal.open('dashboard/home/lostwarn/more.vue@modal')
    		.then(modal=>{
    			modal.vuec.init().show('流失预警','more')
    		})
    	},
    	getLastAttendance(item) {
    		return moment(item.last_attendance_time).format('YYYY-MM-DD')
    	}
    }
}
</script>
<style lang="less">
	.stu-loss-warn {
		.panel-content {
			position: relative;
		}
		.footer {
			position: absolute;
			right: 10px;
			bottom: 10px;
		}
		.info {
			color: #03A9F3;
		}
	}
</style>